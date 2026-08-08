package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.mapper.QuizMapper;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizQueryServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private com.project.skillforgebackend.ai.service.AIService aiService;

    @Mock
    private QuizMapper quizMapper;

    @Mock
    private QuizResultBuilder quizResultBuilder;

    private QuizQueryService queryService;

    private User user;
    private Quiz quiz;

    @BeforeEach
    void setUp() {
        queryService = new QuizQueryService(
                quizRepository,
                aiService,
                quizMapper,
                quizResultBuilder
        );

        user = User.builder()
                .id(UUID.randomUUID())
                .email("learner@test.com")
                .fullName("Learner")
                .build();

        Question question = Question.builder()
                .id(UUID.randomUUID())
                .content("What is Java?")
                .correctAnswer("A language")
                .build();

        quiz = Quiz.builder()
                .id(UUID.randomUUID())
                .user(user)
                .status(Quiz.QuizStatus.IN_PROGRESS)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .maxScore(10)
                .questions(List.of(question))
                .build();
    }

    @Test
    void getActiveQuiz_returnsInProgressQuiz() {
        when(quizRepository.findTopByUserAndStatusOrderByStartedAtDesc(
                user, Quiz.QuizStatus.IN_PROGRESS))
                .thenReturn(Optional.of(quiz));
        when(quizMapper.toDto(quiz)).thenReturn(QuizDto.builder()
                .id(quiz.getId().toString())
                .status(Quiz.QuizStatus.IN_PROGRESS)
                .build());

        QuizDto dto = queryService.getActiveQuiz(user);

        assertThat(dto.getStatus()).isEqualTo(Quiz.QuizStatus.IN_PROGRESS);
    }

    @Test
    void getActiveQuiz_abandonsExpiredQuiz() {
        quiz.setExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(quizRepository.findTopByUserAndStatusOrderByStartedAtDesc(
                user, Quiz.QuizStatus.IN_PROGRESS))
                .thenReturn(Optional.of(quiz));

        queryService.getActiveQuiz(user);

        assertThat(quiz.getStatus()).isEqualTo(Quiz.QuizStatus.ABANDONED);
        verify(quizRepository).save(quiz);
    }

    @Test
    void getActiveQuiz_throwsWhenNoInProgressQuiz() {
        when(quizRepository.findTopByUserAndStatusOrderByStartedAtDesc(
                user, Quiz.QuizStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> queryService.getActiveQuiz(user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getQuiz_returnsDtoForOwnedQuiz() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.of(quiz));
        when(quizMapper.toDto(quiz)).thenReturn(QuizDto.builder()
                .id(quiz.getId().toString())
                .build());

        assertThat(queryService.getQuiz(user, quiz.getId()).getId())
                .isEqualTo(quiz.getId().toString());
    }

    @Test
    void getQuiz_throwsWhenQuizNotOwned() {
        when(quizRepository.findByIdAndUser(quiz.getId(), user))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> queryService.getQuiz(user, quiz.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
