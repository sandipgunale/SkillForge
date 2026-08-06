package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.enums.LearningLevel;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Topic;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DashboardMetricsBuilderTest {

    private final DashboardMetricsBuilder builder = new DashboardMetricsBuilder();

    private Topic topic(String name) {
        return Topic.builder()
                .id(UUID.randomUUID())
                .name(name)
                .build();
    }

    private Progress progress(Topic topic, int minutes, int completion, BigDecimal avg) {
        return Progress.builder()
                .topic(topic)
                .minutesSpent(minutes)
                .completionPercentage((short) completion)
                .averageScore(avg)
                .quizzesTaken(1)
                .build();
    }

    private Quiz quiz(int score, int maxScore) {
        return Quiz.builder()
                .source(QuizSource.TOPIC)
                .score(score)
                .maxScore(maxScore)
                .completedAt(LocalDateTime.now())
                .build();
    }

    private LearningPathProgress pathProgress(LearningPath path, int minutes) {
        return LearningPathProgress.builder()
                .learningPath(path)
                .minutesSpent(minutes)
                .completedWeeks(List.of(1, 2))
                .build();
    }

    @Test
    void aggregatesLearningTimeTopicsAndPaths() {
        LearningPath path = LearningPath.builder()
                .id(UUID.randomUUID())
                .title("Java")
                .build();

        var metrics = builder.build(
                List.of(
                        progress(topic("A"), 30, 100, BigDecimal.valueOf(90)),
                        progress(topic("B"), 10, 50, BigDecimal.valueOf(40))
                ),
                List.of(pathProgress(path, 60)),
                List.of(quiz(8, 10)),
                1
        );

        // 40 topic minutes + 60 path minutes
        assertThat(metrics.totalLearningMinutes()).isEqualTo(100);
        assertThat(metrics.studyHours()).isEqualTo("1h 40m");
        assertThat(metrics.totalTopicsStarted()).isEqualTo(2);
        assertThat(metrics.completedTopics()).isEqualTo(1);
        assertThat(metrics.mostActiveTopic()).isEqualTo("A");
        assertThat(metrics.averageMinutesPerTopic()).isEqualTo(50);
        assertThat(metrics.overallAverageScore())
                .isEqualByComparingTo("80.00");
        assertThat(metrics.learningLevel()).isEqualTo(LearningLevel.ADVANCED);
    }

    @Test
    void healthScoreUsesAverageWeightAndIsCapped() {
        var metrics = builder.build(
                List.of(progress(topic("A"), 5, 100, BigDecimal.valueOf(100))),
                List.of(),
                List.of(quiz(10, 10)),
                1
        );

        // 100*0.8 + min(1,10) + min(1,20)*0.5 = 80 + 1 + 0.5 = 81.5 -> 82
        assertThat(metrics.learningHealthScore()).isEqualTo(82);
        assertThat(metrics.learningLevel()).isEqualTo(LearningLevel.EXPERT);
    }

    @Test
    void healthScoreCapsAtOneHundred() {
        // 10 topics started (item bonus maxes at 10) + 20 quizzes (0.5 each)
        var items = new java.util.ArrayList<Progress>();
        for (int i = 0; i < 10; i++) {
            items.add(progress(topic("T" + i), 5, 100, BigDecimal.valueOf(100)));
        }

        var metrics = builder.build(items, List.of(), List.of(quiz(10, 10)), 20);

        // 100*0.8 + 10 + 10*0.5*... -> 80 + 10 + (20*0.5=10) = 100 (capped)
        assertThat(metrics.learningHealthScore()).isEqualTo(100);
    }

    @Test
    void emptyProgressYieldsZeroHealthScore() {
        var metrics = builder.build(List.of(), List.of(), List.of(), 0);

        assertThat(metrics.learningHealthScore()).isZero();
        assertThat(metrics.overallAverageScore())
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(metrics.mostActiveTopic()).isNull();
        assertThat(metrics.averageMinutesPerTopic()).isZero();
        assertThat(metrics.studyHours()).isEqualTo("0h 0m");
        assertThat(metrics.learningLevel()).isEqualTo(LearningLevel.BEGINNER);
    }

    @Test
    void averageScoreIgnoresMaxScoreZero() {
        var metrics = builder.build(
                List.of(),
                List.of(),
                List.of(quiz(0, 0), quiz(9, 10), quiz(6, 10)),
                2
        );

        // (90 + 60) / 2 = 75.00, quiz 0/0 excluded
        assertThat(metrics.overallAverageScore())
                .isEqualByComparingTo("75.00");
        assertThat(metrics.learningLevel()).isEqualTo(LearningLevel.ADVANCED);
    }
}
