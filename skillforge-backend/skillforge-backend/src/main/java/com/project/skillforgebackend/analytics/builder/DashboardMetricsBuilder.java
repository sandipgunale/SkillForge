package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.enums.LearningLevel;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

/**
 * Aggregates the headline learning metrics of the dashboard (learning time,
 * health score, level, averages). Pure function of the raw progress rows.
 */
@Component
public class DashboardMetricsBuilder {

    public DashboardMetrics build(
            List<Progress> progressList,
            List<LearningPathProgress> learningPathProgressList,
            List<Quiz> recentQuizzes,
            int totalQuizzesTaken
    ) {

        int topicLearningMinutes = progressList.stream()
                .mapToInt(Progress::getMinutesSpent)
                .sum();

        int learningPathLearningMinutes = learningPathProgressList.stream()
                .mapToInt(LearningPathProgress::getMinutesSpent)
                .sum();

        int totalLearningMinutes =
                topicLearningMinutes + learningPathLearningMinutes;

        String studyHours = String.format(
                "%dh %dm",
                totalLearningMinutes / 60,
                totalLearningMinutes % 60
        );

        int totalTopicsStarted = progressList.size();

        int totalLearningPathsStarted =
                learningPathProgressList.size();

        int totalLearningItems =
                totalTopicsStarted + totalLearningPathsStarted;

        BigDecimal overallAverageScore = averageScore(recentQuizzes);

        int learningHealthScore;
        if (progressList.isEmpty()) {

            learningHealthScore = 0;

        } else {

            learningHealthScore = (int) Math.round(

                    (overallAverageScore.doubleValue() * 0.8)

                            +

                            (Math.min(totalLearningItems, 10))

                            +

                            (Math.min(totalQuizzesTaken, 20) * 0.5)

            );

            learningHealthScore = Math.min(100, learningHealthScore);

        }

        BigDecimal quizAccuracy = overallAverageScore;

        int averageMinutesPerTopic =

                totalTopicsStarted == 0

                        ? 0

                        : totalLearningMinutes / totalTopicsStarted;

        String mostActiveTopic =

                progressList.stream()

                        .max(Comparator.comparing(Progress::getMinutesSpent))

                        .map(progress -> progress.getTopic().getName())

                        .orElse(null);

        int completedTopics =

                (int)

                        progressList.stream()

                                .filter(progress -> progress.getCompletionPercentage() >= 100)

                                .count();

        return new DashboardMetrics(
                totalLearningMinutes,
                studyHours,
                totalTopicsStarted,
                totalQuizzesTaken,
                overallAverageScore,
                quizAccuracy,
                learningHealthScore,
                levelFor(overallAverageScore),
                averageMinutesPerTopic,
                mostActiveTopic,
                completedTopics
        );
    }

    private BigDecimal averageScore(List<Quiz> recentQuizzes) {

        if (recentQuizzes.isEmpty()) {

            return BigDecimal.ZERO;

        }

        double average = recentQuizzes.stream()
                .filter(quiz -> quiz.getMaxScore() > 0)
                .mapToDouble(quiz ->
                        ((double) quiz.getScore() / quiz.getMaxScore()) * 100
                )
                .average()
                .orElse(0);

        return BigDecimal.valueOf(average)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private LearningLevel levelFor(BigDecimal overallAverageScore) {

        if (overallAverageScore.compareTo(BigDecimal.valueOf(90)) >= 0) {

            return LearningLevel.EXPERT;

        }

        if (overallAverageScore.compareTo(BigDecimal.valueOf(75)) >= 0) {

            return LearningLevel.ADVANCED;

        }

        if (overallAverageScore.compareTo(BigDecimal.valueOf(60)) >= 0) {

            return LearningLevel.INTERMEDIATE;

        }

        return LearningLevel.BEGINNER;
    }

    public record DashboardMetrics(
            int totalLearningMinutes,
            String studyHours,
            int totalTopicsStarted,
            int totalQuizzesTaken,
            BigDecimal overallAverageScore,
            BigDecimal quizAccuracy,
            int learningHealthScore,
            LearningLevel learningLevel,
            int averageMinutesPerTopic,
            String mostActiveTopic,
            int completedTopics
    ) {
    }
}
