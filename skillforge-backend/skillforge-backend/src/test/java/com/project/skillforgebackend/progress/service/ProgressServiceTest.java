package com.project.skillforgebackend.progress.service;

import com.project.skillforgebackend.progress.dto.ProgressDto;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.progress.mapper.ProgressMapper;
import com.project.skillforgebackend.progress.repository.ProgressRepository;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.QuizSummaryDto;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private ProgressRepository progressRepository;

    @Spy
    private final ProgressMapper progressMapper = new ProgressMapper();

    @InjectMocks
    private ProgressService progressService;

    private User user;
    private Topic topic;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("student@test.com")
                .build();

        topic = Topic.builder()
                .id(UUID.randomUUID())
                .name("Java")
                .slug("java")
                .build();
    }

    private QuizResultDto resultWithPercentage(double percentage) {
        return QuizResultDto.builder()
                .summary(QuizSummaryDto.builder()
                        .score((int) Math.round(percentage))
                        .maxScore(100)
                        .percentage(percentage)
                        .build())
                .build();
    }

    @Test
    void updateAfterQuiz_createsProgress_onFirstQuiz() {
        when(progressRepository.findByUserAndTopic(user, topic))
                .thenReturn(Optional.empty());

        progressService.updateAfterQuiz(user, topic, resultWithPercentage(80));

        verify(progressRepository).save(any(Progress.class));
    }

    @Test
    void updateAfterQuiz_averagesScoreAcrossQuizzes() {
        Progress progress = Progress.builder()
                .user(user)
                .topic(topic)
                .quizzesTaken(1)
                .averageScore(new BigDecimal("80.00"))
                .minutesSpent(10)
                .build();

        when(progressRepository.findByUserAndTopic(user, topic))
                .thenReturn(Optional.of(progress));

        progressService.updateAfterQuiz(user, topic, resultWithPercentage(60));

        assertThat(progress.getQuizzesTaken()).isEqualTo(2);
        assertThat(progress.getAverageScore())
                .isEqualByComparingTo(new BigDecimal("70.00"));
        assertThat(progress.getMinutesSpent()).isEqualTo(20);
        assertThat(progress.getCompletionPercentage()).isEqualTo((short) 20);
    }

    @Test
    void updateAfterQuiz_capsCompletionAt100() {
        Progress progress = Progress.builder()
                .user(user)
                .topic(topic)
                .quizzesTaken(9)
                .averageScore(BigDecimal.ZERO)
                .minutesSpent(0)
                .build();

        when(progressRepository.findByUserAndTopic(user, topic))
                .thenReturn(Optional.of(progress));

        progressService.updateAfterQuiz(user, topic, resultWithPercentage(100));

        assertThat(progress.getCompletionPercentage()).isEqualTo((short) 100);
    }

    @Test
    void getProgress_aggregatesAcrossTopics() {
        Progress p1 = Progress.builder()
                .user(user)
                .topic(topic)
                .quizzesTaken(2)
                .averageScore(new BigDecimal("70.00"))
                .completionPercentage((short) 100)
                .minutesSpent(20)
                .build();

        Topic topic2 = Topic.builder().id(UUID.randomUUID()).name("SQL").slug("sql").build();

        Progress p2 = Progress.builder()
                .user(user)
                .topic(topic2)
                .quizzesTaken(1)
                .averageScore(new BigDecimal("90.00"))
                .completionPercentage((short) 10)
                .minutesSpent(10)
                .build();

        when(progressRepository.findByUserOrderByLastActivityAtDesc(user))
                .thenReturn(List.of(p1, p2));

        ProgressDto dto = progressService.getProgress(user);

        assertThat(dto.getTotalTopics()).isEqualTo(2);
        assertThat(dto.getCompletedTopics()).isEqualTo(1);
        assertThat(dto.getTotalQuizzesTaken()).isEqualTo(3);
        assertThat(dto.getTotalMinutesSpent()).isEqualTo(30);
        assertThat(dto.getOverallAverageScore())
                .isEqualByComparingTo(
                        new BigDecimal("80.00").setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    void getProgress_returnsZeros_whenNoProgress() {
        when(progressRepository.findByUserOrderByLastActivityAtDesc(user))
                .thenReturn(List.of());

        ProgressDto dto = progressService.getProgress(user);

        assertThat(dto.getTotalTopics()).isZero();
        assertThat(dto.getOverallAverageScore()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
