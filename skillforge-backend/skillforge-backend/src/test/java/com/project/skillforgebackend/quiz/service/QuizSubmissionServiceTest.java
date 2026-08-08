package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.service.AIService;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.QuizExpiredException;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.learningpathprogress.service.LearningPathProgressService;
import com.project.skillforgebackend.progress.service.ProgressService;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.QuestionResultDto;
import com.project.skillforgebackend.quiz.dto.QuizSummaryDto;
import com.project.skillforgebackend.quiz.dto.SubmitAnswersRequest;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.quiz.mapper.QuizAnswerMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizSubmissionServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizAnswerMapper quizAnswerMapper;

    @Mock
    private AIService aiService;

    @Mock
    private QuizResultBuilder quizResultBuilder;

    @Mock
    private ProgressService progressService;

    @Mock
    private LearningPathProgressService learningPathProgressService;

    @Mock
    private GamificationService gamificationService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private QuizSubmissionService submissionService;

    private User user;
    private Topic topic;
    private Quiz quiz;
    private Question question;
    private SubmitAnswersRequest request;

    @BeforeEach
    void setUp() {
        submissionService = new QuizSubmissionService(
                quizRepository,
                quizAnswerMapper,
                aiService,
                quizResultBuilder,
                progressService,
                learningPathProgressService,
                gamificationService,
                eventPublisher
        );

        user = User.builder()
                .id(UUID.randomUUID())
                .email("learner@test.com")
                .fullName("Learner")
                .build();

        topic = Topic.builder()
                .id(UUID.randomUUID())
                .name("Java")
                .build();

        question = Question.builder()
                .id(UUID.randomUUID())
                .content("What is Java?")
                .correctAnswer("A language")
                .build();

        quiz = Quiz.builder()
                .id(UUID.randomUUID())
                .user(user)
                .topic(topic)
                .source(QuizSource.TOPIC)
                .status(Quiz.QuizStatus.IN_PROGRESS)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .maxScore(10)
                .questions(List.of(question))
                .build();

        SubmitAnswersRequest.AnswerItem item =
                new SubmitAnswersRequest.AnswerItem();
        item.setQuestionId(question.getId());
        item.setAnswer("A language");

        request = new SubmitAnswersRequest();
        request.setAnswers(List.of(item));
    }

    private QuizResultDto result() {
        return QuizResultDto.builder()
                .quizId(quiz.getId().toString())
                .summary(QuizSummaryDto.builder()
                        .score(10)
                        .maxScore(10)
                        .percentage(100.0)
                        .build())
                .questions(List.of(
                        QuestionResultDto.builder()
                                .questionId(question.getId().toString())
                                .correct(true)
                                .aiFeedback("Good")
                                .build()
                ))
                .build();
    }

    @Test
    void submitAnswers_evaluatesPersistsAndPublishesEvent() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizAnswerMapper.toAnswerMap(any(SubmitAnswersRequest.class)))
                .thenReturn(Map.of(question.getId(), "A language"));
        when(aiService.evaluateQuiz(quiz)).thenReturn(result());

        var response = submissionService.submitAnswers(user, quiz.getId(), request);

        assertThat(response.getSummary().getScore()).isEqualTo(10);
        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.COMPLETED);
        assertThat(quiz.getCompletedAt()).isNotNull();
        assertThat(question.getIsCorrect()).isTrue();
        assertThat(question.getUserAnswer()).isEqualTo("A language");
        assertThat(question.getAiFeedback()).isEqualTo("Good");

        verify(quizRepository).save(quiz);
        verify(progressService).updateAfterQuiz(eq(user), eq(topic), eq(response));
        verify(gamificationService).checkAndAwardBadges(user);
        verify(eventPublisher).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void submitAnswers_fallsBackToOfflineGradingWhenAiUnavailable() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizAnswerMapper.toAnswerMap(any(SubmitAnswersRequest.class)))
                .thenReturn(Map.of(question.getId(), "A language"));
        when(aiService.evaluateQuiz(quiz))
                .thenThrow(new AIServiceException("Gemini down"));
        when(quizResultBuilder.build(quiz, false)).thenReturn(result());

        var response = submissionService.submitAnswers(user, quiz.getId(), request);

        assertThat(response.getSummary().getScore()).isEqualTo(10);
        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.COMPLETED);
        verify(progressService).updateAfterQuiz(any(), any(), any());
    }

    @Test
    void submitAnswers_expiredQuizIsAbandonedAndRejected() {
        quiz.setExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));

        assertThatThrownBy(() ->
                submissionService.submitAnswers(user, quiz.getId(), request))
                .isInstanceOf(QuizExpiredException.class)
                .hasMessageContaining("expired");

        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.ABANDONED);
        verify(quizRepository, never()).save(any(Quiz.class));
        verify(eventPublisher, never()).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void submitAnswers_rejectsAlreadyCompletedQuiz() {
        quiz.setStatus(Quiz.QuizStatus.COMPLETED);

        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));

        assertThatThrownBy(() ->
                submissionService.submitAnswers(user, quiz.getId(), request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already submitted");
    }

    @Test
    void submitAnswers_rejectsAbandonedQuiz() {
        quiz.setStatus(Quiz.QuizStatus.ABANDONED);

        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));

        assertThatThrownBy(() ->
                submissionService.submitAnswers(user, quiz.getId(), request))
                .isInstanceOf(QuizExpiredException.class)
                .hasMessageContaining("abandoned");
    }

    @Test
    void submitAnswers_throwsWhenQuizDoesNotBelongToUser() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                submissionService.submitAnswers(user, quiz.getId(), request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void saveAnswers_persistsPartialAnswersWithoutFinalizingQuiz() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizAnswerMapper.toAnswerMap(any(SubmitAnswersRequest.class)))
                .thenReturn(Map.of(question.getId(), "A language"));

        submissionService.saveAnswers(user, quiz.getId(), request);

        assertThat(question.getUserAnswer()).isEqualTo("A language");
        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.IN_PROGRESS);
        verify(quizRepository).save(quiz);
        verify(aiService, never()).evaluateQuiz(any());
        verify(eventPublisher, never()).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void saveAnswers_mergesPartialSetLeavingOtherAnswersUntouched() {
        Question second = Question.builder()
                .id(UUID.randomUUID())
                .content("Second?")
                .userAnswer("saved before")
                .build();
        quiz.setQuestions(List.of(question, second));

        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizAnswerMapper.toAnswerMap(any(SubmitAnswersRequest.class)))
                .thenReturn(Map.of(question.getId(), "A language"));

        submissionService.saveAnswers(user, quiz.getId(), request);

        assertThat(question.getUserAnswer()).isEqualTo("A language");
        assertThat(second.getUserAnswer()).isEqualTo("saved before");
        verify(quizRepository).save(quiz);
    }

    @Test
    void saveAnswers_rejectsExpiredQuiz() {
        quiz.setExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));

        assertThatThrownBy(() ->
                submissionService.saveAnswers(user, quiz.getId(), request))
                .isInstanceOf(QuizExpiredException.class)
                .hasMessageContaining("expired");

        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.ABANDONED);
        verify(quizRepository, never()).save(any(Quiz.class));
    }

    @Test
    void saveAnswers_throwsWhenQuizDoesNotBelongToUser() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                submissionService.saveAnswers(user, quiz.getId(), request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void submitAnswers_updatesLearningPathProgressForPathQuizzes() {
        quiz.setSource(QuizSource.LEARNING_PATH);
        quiz.setWeekNumber(2);
        quiz.setLearningPath(null);

        // learning path quiz keeps the topic set but source decides routing
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizAnswerMapper.toAnswerMap(any(SubmitAnswersRequest.class)))
                .thenReturn(Map.of(question.getId(), "A language"));
        when(aiService.evaluateQuiz(quiz)).thenReturn(result());

        submissionService.submitAnswers(user, quiz.getId(), request);

        verify(learningPathProgressService).updateAfterLearningPathQuiz(
                eq(user), eq(quiz.getLearningPath()), eq(2), eq(100.0), any(Integer.class)
        );
        verify(progressService, never()).updateAfterQuiz(any(), any(), any());
    }
}