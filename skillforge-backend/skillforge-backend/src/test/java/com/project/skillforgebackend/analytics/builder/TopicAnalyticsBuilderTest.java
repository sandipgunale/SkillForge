package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.dto.TopicAnalyticsDto;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.resource.entity.Topic;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TopicAnalyticsBuilderTest {

    private final TopicAnalyticsBuilder builder = new TopicAnalyticsBuilder();

    private Progress progress(String topicName, BigDecimal avg, int minutes, int completion, int quizzes) {
        return Progress.builder()
                .topic(Topic.builder()
                        .id(UUID.randomUUID())
                        .name(topicName)
                        .build())
                .averageScore(avg)
                .minutesSpent(minutes)
                .completionPercentage((short) completion)
                .quizzesTaken(quizzes)
                .build();
    }

    @Test
    void sortsTopicsByScoreDescThenMinutesDesc() {
        var parts = builder.build(List.of(
                progress("Weak", BigDecimal.valueOf(50), 10, 20, 1),
                progress("Strong", BigDecimal.valueOf(85), 5, 100, 2),
                progress("Stronger", BigDecimal.valueOf(85), 20, 100, 2)
        ));

        List<TopicAnalyticsDto> rows = parts.topicAnalytics();
        assertThat(rows).hasSize(3);
        assertThat(rows.get(0).getTopicName()).isEqualTo("Stronger");
        assertThat(rows.get(1).getTopicName()).isEqualTo("Strong");
        assertThat(rows.get(2).getTopicName()).isEqualTo("Weak");
    }

    @Test
    void identifiesBestAndWorstTopics() {
        var parts = builder.build(List.of(
                progress("Mid", BigDecimal.valueOf(70), 10, 50, 2),
                progress("Low", BigDecimal.valueOf(45), 10, 20, 1),
                progress("High", BigDecimal.valueOf(95), 10, 100, 3)
        ));

        assertThat(parts.bestTopic().getTopicName()).isEqualTo("High");
        assertThat(parts.worstTopic().getTopicName()).isEqualTo("Low");
    }

    @Test
    void worstTopicRequiresAtLeastOneQuiz() {
        var parts = builder.build(List.of(
                progress("NeverQuized", BigDecimal.valueOf(10), 10, 0, 0),
                progress("Quized", BigDecimal.valueOf(80), 10, 100, 1)
        ));

        assertThat(parts.worstTopic().getTopicName()).isEqualTo("Quized");
    }

    @Test
    void weakAreasAreTopicsBelowSixtyPercent() {
        var parts = builder.build(List.of(
                progress("Low", BigDecimal.valueOf(40), 10, 20, 1),
                progress("Ok", BigDecimal.valueOf(70), 10, 50, 1),
                progress("Zero", BigDecimal.valueOf(0), 10, 0, 0)
        ));

        assertThat(parts.weakAreas()).containsExactly("Low");
    }

    @Test
    void buildsRecommendationsForWeakAndIncompleteTopics() {
        var parts = builder.build(List.of(
                progress("Low", BigDecimal.valueOf(40), 10, 20, 1),
                progress("Mid", BigDecimal.valueOf(70), 10, 50, 1),
                progress("Done", BigDecimal.valueOf(90), 10, 100, 1)
        ));

        assertThat(parts.recommendations())
                .extracting(r -> r.getTitle())
                .contains(
                        "Practice Low",
                        "Continue Mid",
                        "Continue Low"
                );
    }

    @Test
    void emptyProgressYieldsFallbackRecommendation() {
        var parts = builder.build(List.of());

        assertThat(parts.topicAnalytics()).isEmpty();
        assertThat(parts.bestTopic()).isNull();
        assertThat(parts.worstTopic()).isNull();
        assertThat(parts.recommendations())
                .extracting(r -> r.getTitle())
                .containsExactly("Explore Advanced Topics");
    }
}
