package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.ai.guardrail.AiUsageTracker;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.exception.QuizExpiredException;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.learningpathprogress.service.LearningPathProgressService;
import com.project.skillforgebackend.progress.service.ProgressService;
import com.project.skillforgebackend.quiz.dto.*;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.mapper.QuizMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.project.skillforgebackend.quiz.specification.QuizSpecification;
import org.springframework.data.jpa.domain.Specification;
import com.project.skillforgebackend.resource.entity.Resource;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.quiz.entity.QuizSource;

import java.util.ArrayList;
import java.util.List;

import com.project.skillforgebackend.quiz.validator.QuizRequestValidator;
import com.project.skillforgebackend.quiz.mapper.QuizAnswerMapper;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;
    private final AIService aiService;
    private final ProgressService progressService;
    private final QuizMapper quizMapper;
    private final LearningPathRepository learningPathRepository;
    private final LearningPathProgressService learningPathProgressService;
    private final QuizRequestValidator quizRequestValidator;
    private final QuizAnswerMapper quizAnswerMapper;
    private final AiUsageTracker aiUsageTracker;
    private final GamificationService gamificationService;
    private final QuizResultBuilder quizResultBuilder;

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

        questions.forEach(question -> question.setQuiz(quiz));

        quiz.setQuestions(questions);
        quiz.setExpiresAt(calculateExpiry(questions.size()));

        Quiz savedQuiz = quizRepository.save(quiz);

        log.info(
                "Quiz {} generated successfully for {}",
                savedQuiz.getId(),
                user.getEmail()
        );

        return quizMapper.toDto(savedQuiz);
    }

    private QuizDto generateLearningPathQuiz(
            User user,
            QuizRequest request
    ) {

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

        JsonNode roadmap = learningPath.getRoadmapJson();

        ArrayNode weeks = (ArrayNode) roadmap.get("weeks");

        if (weeks == null || weeks.isEmpty()) {
            throw new IllegalStateException(
                    "Learning path does not contain any weeks."
            );
        }

        JsonNode selectedWeek = null;

        for (JsonNode week : weeks) {

            if (week.get("week").asInt() == request.getWeekNumber()) {
                selectedWeek = week;
                break;
            }

        }

        if (selectedWeek == null) {
            throw new ResourceNotFoundException(
                    "Week",
                    request.getWeekNumber()
            );
        }

        JsonNode topicsNode = selectedWeek.get("topics");

        if (topicsNode == null || !topicsNode.isArray() || topicsNode.isEmpty()) {
            throw new IllegalStateException(
                    "No topics found for week " + request.getWeekNumber()
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
                    "No valid topics found for week " + request.getWeekNumber()
            );
        }

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

        questions.forEach(question -> question.setQuiz(quiz));

        quiz.setQuestions(questions);
        quiz.setExpiresAt(calculateExpiry(questions.size()));

        Quiz savedQuiz = quizRepository.save(quiz);

        log.info("Questions generated = {}", questions.size());

        log.info("Quiz.totalQuestions = {}", quiz.getTotalQuestions());

        log.info("Quiz.maxScore = {}", quiz.getMaxScore());

        log.info("Quiz.questions.size = {}", quiz.getQuestions().size());

        log.info(
                "Learning Path Quiz {} generated successfully for {} (Week {})",
                savedQuiz.getId(),
                user.getEmail(),
                request.getWeekNumber()
        );

        return quizMapper.toDto(savedQuiz);
    }

    @Transactional
    public QuizDto getQuiz(User user, UUID quizId) {

        Quiz quiz = quizRepository
                .findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId
                        ));

        abandonIfExpired(quiz);

        return quizMapper.toDto(quiz);
    }

    /**
     * Resume the user's most recent in-progress quiz that hasn't expired,
     * or throw 404 if there is none.
     */
    @Transactional
    public QuizDto getActiveQuiz(User user) {

        Quiz quiz = quizRepository
                .findTopByUserAndStatusOrderByStartedAtDesc(
                        user,
                        Quiz.QuizStatus.IN_PROGRESS
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz in progress",
                                null
                        ));

        abandonIfExpired(quiz);

        return quizMapper.toDto(quiz);
    }

    private void abandonIfExpired(Quiz quiz) {
        if (quiz.getStatus() == Quiz.QuizStatus.IN_PROGRESS
                && quiz.isExpired()) {

            quiz.setStatus(Quiz.QuizStatus.ABANDONED);
            quizRepository.save(quiz);

            log.info(
                    "Quiz {} abandoned because it expired at {}",
                    quiz.getId(),
                    quiz.getExpiresAt()
            );
        }
    }

    /**
     * Server-side session deadline. Matches the frontend timer:
     * 1.5 minutes per question, minimum of 2 minutes.
     */
    static java.time.LocalDateTime calculateExpiry(int questionCount) {
        long minutes = Math.max(
                2,
                (long) Math.ceil(questionCount * 1.5)
        );

        return java.time.LocalDateTime.now().plusMinutes(minutes);
    }

    public QuizResultDto getQuizResult(
            User user,
            UUID quizId
    ) {

        Quiz quiz = quizRepository
                .findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId
                        ));

        if (quiz.getStatus() != Quiz.QuizStatus.COMPLETED) {

            abandonIfExpired(quiz);

            throw new IllegalStateException(
                    "Quiz has not been completed yet."
            );
        }

        return evaluateWithFallback(quiz);
    }

    /**
     * Evaluates via Gemini, falling back to deterministic offline grading
     * (correct answers are stored with the quiz) whenever the AI service
     * is unreachable, so a Gemini outage can never block finishing a quiz.
     */
    private QuizResultDto evaluateWithFallback(Quiz quiz) {

        try {

            return aiService.evaluateQuiz(quiz);

        } catch (AIServiceException ex) {

            log.warn(
                    "Gemini unavailable; grading quiz {} offline. Reason: {}",
                    quiz.getId(),
                    ex.getMessage()
            );

            return quizResultBuilder.build(quiz, false);
        }
    }

    @Transactional
    public QuizResultDto submitAnswers(
            User user,
            UUID quizId,
            SubmitAnswersRequest request
    ) {

        Quiz quiz = getQuizByIdAndUser(user, quizId);

        validateQuizSubmission(quiz);

        applyUserAnswers(quiz, request);

        QuizResultDto result = evaluateWithFallback(quiz);

        applyEvaluationResults(quiz, result);

        updateQuizStatus(quiz, result);

        quizRepository.save(quiz);

        updateProgress(user, quiz, result);

        gamificationService.checkAndAwardBadges(user);

        log.info(
                "Quiz {} submitted by {}",
                quizId,
                user.getEmail()
        );

        return result;
    }
    private Quiz getQuizByIdAndUser(
            User user,
            UUID quizId
    ) {

        return quizRepository
                .findByIdAndUser(quizId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Quiz",
                                quizId
                        ));
    }
    private void validateQuizSubmission(
            Quiz quiz
    ) {

        if (quiz.getStatus() == Quiz.QuizStatus.ABANDONED) {

            throw new QuizExpiredException(
                    "Quiz was abandoned and can no longer be submitted."
            );

        }

        if (quiz.getStatus() == Quiz.QuizStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Quiz already submitted."
            );

        }

        if (quiz.isExpired()) {

            quiz.setStatus(Quiz.QuizStatus.ABANDONED);

            throw new QuizExpiredException(
                    "Quiz session expired. Please start a new quiz."
            );

        }

    }
    private void applyUserAnswers(
            Quiz quiz,
            SubmitAnswersRequest request
    ) {

        Map<UUID, String> answerMap =
                quizAnswerMapper.toAnswerMap(request);

        quiz.getQuestions().forEach(question ->

                question.setUserAnswer(

                        answerMap.getOrDefault(
                                question.getId(),
                                ""
                        )

                )

        );

    }
    private void applyEvaluationResults(
            Quiz quiz,
            QuizResultDto result
    ) {

        Map<String, com.project.skillforgebackend.quiz.entity.Question> questionMap =
                quiz.getQuestions()
                        .stream()
                        .collect(java.util.stream.Collectors.toMap(
                                question -> question.getId().toString(),
                                question -> question
                        ));

        result.getQuestions().forEach(resultQuestion -> {

            var question =
                    questionMap.get(
                            resultQuestion.getQuestionId()
                    );

            if (question != null) {

                question.setIsCorrect(
                        resultQuestion.isCorrect()
                );

                question.setAiFeedback(
                        resultQuestion.getAiFeedback()
                );

            }

        });

    }
    private void updateQuizStatus(
            Quiz quiz,
            QuizResultDto result
    ) {

        quiz.setScore(
                result.getSummary().getScore()
        );

        quiz.setStatus(
                Quiz.QuizStatus.COMPLETED
        );

        quiz.setCompletedAt(
                LocalDateTime.now()
        );

    }
    private void updateProgress(
            User user,
            Quiz quiz,
            QuizResultDto result
    ) {

        if (quiz.getSource() == QuizSource.TOPIC) {

            progressService.updateAfterQuiz(

                    user,

                    quiz.getTopic(),

                    result

            );

            return;

        }

        learningPathProgressService
                .updateAfterLearningPathQuiz(

                        user,

                        quiz.getLearningPath(),

                        quiz.getWeekNumber(),

                        result.getSummary().getPercentage(),

                        quiz.getDurationMinutes()

                );

    }

    public PagedResponse<QuizDto> getHistory(

            User user,

            QuizSource source,

            Resource.Difficulty difficulty,

            Quiz.QuizStatus status,

            Pageable pageable

    ) {

        Specification<Quiz> specification =

                QuizSpecification.hasUser(user)
                        .and(QuizSpecification.hasSource(source))
                        .and(QuizSpecification.hasDifficulty(difficulty))
                        .and(QuizSpecification.hasStatus(status));

        Page<Quiz> page =

                quizRepository.findAll(
                        specification,
                        pageable
                );

        return PagedResponse.<QuizDto>builder()

                .content(
                        page.getContent()
                                .stream()
                                .map(quizMapper::toDto)
                                .toList()
                )

                .page(page.getNumber())

                .size(page.getSize())

                .totalElements(page.getTotalElements())

                .totalPages(page.getTotalPages())

                .first(page.isFirst())

                .last(page.isLast())

                .hasNext(page.hasNext())

                .hasPrevious(page.hasPrevious())

                .build();

    }

}