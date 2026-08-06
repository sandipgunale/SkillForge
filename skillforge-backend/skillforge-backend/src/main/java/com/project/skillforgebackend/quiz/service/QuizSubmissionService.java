package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.QuizExpiredException;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.learningpathprogress.service.LearningPathProgressService;
import com.project.skillforgebackend.progress.service.ProgressService;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.SubmitAnswersRequest;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.mapper.QuizAnswerMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Submission side of the quiz lifecycle: validates the session state,
 * applies the user's answers, evaluates (AI with offline fallback) and
 * persists the verdict, then updates progress and badges.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizSubmissionService {

    private final QuizRepository quizRepository;
    private final QuizAnswerMapper quizAnswerMapper;
    private final AIService aiService;
    private final QuizResultBuilder quizResultBuilder;
    private final ProgressService progressService;
    private final LearningPathProgressService learningPathProgressService;
    private final GamificationService gamificationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @CacheEvict(cacheNames = "dashboard", key = "#user.id")
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

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.QUIZ_SUBMITTED,
                user.getId(),
                "quiz",
                quiz.getId().toString(),
                "score " + result.getSummary().getScore()
                        + "/" + result.getSummary().getMaxScore()
        ));

        log.info(
                "Quiz {} submitted by {}",
                quizId,
                user.getEmail()
        );

        return result;
    }

    /**
     * Evaluates via Gemini, falling back to deterministic offline grading
     * (correct answers are stored with the quiz) whenever the AI service
     * is unreachable, so a Gemini outage can never block finishing a quiz.
     */
    private QuizResultDto evaluateWithFallback(Quiz quiz) {

        try {

            return aiService.evaluateQuiz(quiz);

        } catch (com.project.skillforgebackend.ai.exception.AIServiceException ex) {

            log.warn(
                    "Gemini unavailable; grading quiz {} offline. Reason: {}",
                    quiz.getId(),
                    ex.getMessage()
            );

            return quizResultBuilder.build(quiz, false);
        }
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

        Map<String, Question> questionMap =
                quiz.getQuestions()
                        .stream()
                        .collect(Collectors.toMap(
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

}
