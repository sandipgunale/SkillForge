package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LearningPathAnalyticsBuilderTest {

    private final LearningPathAnalyticsBuilder builder = new LearningPathAnalyticsBuilder();

    private LearningPathProgress pathProgress(String title, BigDecimal avg, int minutes) {
        return LearningPathProgress.builder()
                .learningPath(LearningPath.builder()
                        .id(UUID.randomUUID())
                        .title(title)
                        .build())
                .averageQuizScore(avg)
                .minutesSpent(minutes)
                .quizzesTaken(1)
                .completionPercentage((short) 100)
                .build();
    }

    @Test
    void sortsByAverageQuizScoreDesc() {
        var rows = builder.build(List.of(
                pathProgress("Low", BigDecimal.valueOf(40), 10),
                pathProgress("High", BigDecimal.valueOf(90), 10),
                pathProgress("Mid", BigDecimal.valueOf(60), 10)
        ));

        assertThat(rows).hasSize(3);
        assertThat(rows.get(0).getLearningPathTitle()).isEqualTo("High");
        assertThat(rows.get(1).getLearningPathTitle()).isEqualTo("Mid");
        assertThat(rows.get(2).getLearningPathTitle()).isEqualTo("Low");
    }

    @Test
    void mapsAllFields() {
        var rows = builder.build(List.of(
                pathProgress("Java", BigDecimal.valueOf(75), 120)
        ));

        var row = rows.get(0);
        assertThat(row.getLearningPathTitle()).isEqualTo("Java");
        assertThat(row.getMinutesSpent()).isEqualTo(120);
        assertThat(row.getQuizzesTaken()).isEqualTo(1);
        assertThat(row.getCompletionPercentage()).isEqualTo((short) 100);
        assertThat(row.getAverageQuizScore())
                .isEqualByComparingTo(BigDecimal.valueOf(75));
    }

    @Test
    void emptyListYieldsEmptyRows() {
        assertThat(builder.build(List.of())).isEmpty();
    }
}
