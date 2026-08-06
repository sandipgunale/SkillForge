package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Topic;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QuizAnalyticsBuilderTest {

    private final QuizAnalyticsBuilder builder = new QuizAnalyticsBuilder();

    @Test
    void mapsTopicQuizTitleFromTopicName() {
        Topic topic = Topic.builder()
                .id(UUID.randomUUID())
                .name("Algorithms")
                .build();

        Quiz quiz = Quiz.builder()
                .id(UUID.randomUUID())
                .source(QuizSource.TOPIC)
                .topic(topic)
                .score(7)
                .maxScore(10)
                .completedAt(LocalDateTime.of(2026, 8, 1, 12, 0))
                .build();

        var parts = builder.build(List.of(quiz));

        assertThat(parts.recentQuizScores()).hasSize(1);
        assertThat(parts.recentQuizScores().get(0).getTopicName())
                .isEqualTo("Algorithms");
        assertThat(parts.recentQuizScores().get(0).getPercentage())
                .isEqualByComparingTo(BigDecimal.valueOf(70.00));
        assertThat(parts.lastQuiz().getQuizId())
                .isEqualTo(quiz.getId().toString());
    }

    @Test
    void mapsLearningPathQuizTitleFromPathAndWeek() {
        LearningPath path = LearningPath.builder()
                .id(UUID.randomUUID())
                .title("Spring Boot")
                .build();

        Quiz quiz = Quiz.builder()
                .id(UUID.randomUUID())
                .source(QuizSource.LEARNING_PATH)
                .learningPath(path)
                .weekNumber(3)
                .score(5)
                .maxScore(10)
                .build();

        var parts = builder.build(List.of(quiz));

        assertThat(parts.lastQuiz().getTopicName())
                .isEqualTo("Spring Boot - Week 3");
    }

    @Test
    void emptyListYieldsNoLastQuiz() {
        var parts = builder.build(List.of());

        assertThat(parts.recentQuizScores()).isEmpty();
        assertThat(parts.lastQuiz()).isNull();
    }
}
