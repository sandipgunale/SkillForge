package com.project.skillforgebackend.quiz.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.project.skillforgebackend.ai.guardrail.AiUsageTracker;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.dto.QuizRequest;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.mapper.QuizMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.quiz.validator.QuizRequestValidator;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import com.project.skillforgebackend.user.entity.User;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Creation side of the quiz lifecycle: validates the request, applies the
 * per-user AI quota, then generates a topic- or learning-path-based quiz.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizGenerationService {

    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;
    private final LearningPathRepository learningPathRepository;
    private final AIService aiService;
    private final QuizMapper quizMapper;
    private final QuizRequestValidator quizRequestValidator;
    private final AiUsageTracker aiUsageTracker;
    private final MeterRegistry meterRegistry;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public QuizDto generateQuiz(
            User user,
            QuizRequest request
    ) {
        quizRequestValidator.validate(request);

        aiUsageTracker.consume(
                user.getId(),
                request.getQuestionCount()
        );

        return switch (request.getSource()) {

            case TOPIC ->
                    generateTopicQuiz(
                            user,
                            request
                    );

            case LEARNING_PATH ->
                    generateLearningPathQuiz(
                            user,
                            request
                    );

        };

    }

    @Transactional
    public QuizDto generateTopicQuiz(User user, QuizRequest request) {

        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Topic",
                                request.getTopicId()
                        ));

        var questions = aiService.generateQuestions(
                topic.getName(),
                request.getDifficulty(),
                request.getQuestionCount(),
                request.getQuestionTypes()
        );

        Quiz quiz = Quiz.builder()
                .user(user)
                .topic(topic)
                .source(QuizSource.TOPIC)
                .difficulty(request.getDifficulty())
                .totalQuestions(questions.size())
                .maxScore(questions.size())
                .build();

        persistGeneratedQuiz(quiz, questions);

        Quiz savedQuiz = quizRepository.save(quiz);

        publishGenerated(savedQuiz, "topic");

        log.info(
                "Quiz {} generated successfully for {}",
                savedQuiz.getId(),
                user.getEmail()
        );

        meterRegistry.counter(
                "skillforge_quizzes_generated",
                "source",
                "topic"
        ).increment();

        return quizMapper.toDto(savedQuiz);
    }

    @Transactional
    public QuizDto generateLearningPathQuiz(User user, QuizRequest request) {

        LearningPath learningPath = learningPathRepository
                .findById(request.getLearningPathId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Learning Path",
                                request.getLearningPathId()
                        )
                );

        // Security Check
        if (!learningPath.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    "Learning Path",
                    request.getLearningPathId()
            );
        }

        List<String> topics = extractWeekTopics(
                learningPath.getRoadmapJson(),
                request.getWeekNumber()
        );

        var questions = aiService.generateQuestions(
                topics,
                request.getDifficulty(),
                request.getQuestionCount(),
                request.getQuestionTypes()
        );

        Quiz quiz = Quiz.builder()
                .user(user)
                .source(QuizSource.LEARNING_PATH)
                .learningPath(learningPath)
                .weekNumber(request.getWeekNumber())
                .difficulty(request.getDifficulty())
                .totalQuestions(questions.size())
                .maxScore(questions.size())
                .build();

        persistGeneratedQuiz(quiz, questions);

        Quiz savedQuiz = quizRepository.save(quiz);

        publishGenerated(savedQuiz, "learning_path");

        log.info(
                "Learning Path Quiz {} generated successfully for {} (Week {})",
                savedQuiz.getId(),
                user.getEmail(),
                request.getWeekNumber()
        );

        meterRegistry.counter(
                "skillforge_quizzes_generated",
                "source",
                "learning_path"
        ).increment();

        return quizMapper.toDto(savedQuiz);
    }

    /**
     * Extracts the topic names of a learning-path week from the roadmap JSON
     * and fails with a precise error when the path/roadmap is unusable.
     */
    private List<String> extractWeekTopics(
            JsonNode roadmap,
            Integer weekNumber
    ) {
        ArrayNode weeks = (ArrayNode) roadmap.get("weeks");

        if (weeks == null || weeks.isEmpty()) {
            throw new IllegalStateException(
                    "Learning path does not contain any weeks."
            );
        }

        JsonNode selectedWeek = null;

        for (JsonNode week : weeks) {

            if (week.get("week").asInt() == weekNumber) {
                selectedWeek = week;
                break;
            }

        }

        if (selectedWeek == null) {
            throw new ResourceNotFoundException(
                    "Week",
                    weekNumber
            );
        }

        JsonNode topicsNode = selectedWeek.get("topics");

        if (topicsNode == null || !topicsNode.isArray() || topicsNode.isEmpty()) {
            throw new IllegalStateException(
                    "No topics found for week " + weekNumber
            );
        }

        List<String> topics = new ArrayList<>();

        for (JsonNode topic : topicsNode) {

            JsonNode name = topic.get("name");

            if (name != null && !name.asText().isBlank()) {
                topics.add(name.asText());
            }

        }

        if (topics.isEmpty()) {
            throw new IllegalStateException(
                    "No valid topics found for week " + weekNumber
            );
        }

        return topics;
    }

    private void persistGeneratedQuiz(
            Quiz quiz,
            List<Question> questions
    ) {
        questions.forEach(question -> question.setQuiz(quiz));

        quiz.setQuestions(questions);
        quiz.setExpiresAt(calculateExpiry(questions.size()));
    }

    private void publishGenerated(Quiz quiz, String source) {
        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.QUIZ_GENERATED,
                quiz.getUser().getId(),
                "quiz",
                quiz.getId().toString(),
                "generated from source " + source
        ));
    }

    /**
     * Server-side session deadline. Matches the frontend timer:
     * 1.5 minutes per question, minimum of 2 minutes.
     */
    static LocalDateTime calculateExpiry(int questionCount) {
        long minutes = Math.max(
                2,
                (long) Math.ceil(questionCount * 1.5)
        );

        return LocalDateTime.now().plusMinutes(minutes);
    }
}
