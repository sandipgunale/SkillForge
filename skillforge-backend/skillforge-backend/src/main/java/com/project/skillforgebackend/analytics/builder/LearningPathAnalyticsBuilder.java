package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.dto.LearningPathAnalyticsDto;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Learning-path analytics of the dashboard: per-path completion and quiz
 * performance rows.
 */
@Component
public class LearningPathAnalyticsBuilder {

    public List<LearningPathAnalyticsDto> build(
            List<LearningPathProgress> learningPathProgressList
    ) {

        return learningPathProgressList.stream()

                .sorted(
                        Comparator.comparing(
                                LearningPathProgress::getAverageQuizScore
                        ).reversed()
                )

                .map(progress ->

                        LearningPathAnalyticsDto.builder()

                                .learningPathId(
                                        progress.getLearningPath().getId().toString()
                                )

                                .learningPathTitle(
                                        progress.getLearningPath().getTitle()
                                )

                                .completionPercentage(
                                        progress.getCompletionPercentage()
                                )

                                .quizzesTaken(
                                        progress.getQuizzesTaken()
                                )

                                .minutesSpent(
                                        progress.getMinutesSpent()
                                )

                                .averageQuizScore(
                                        progress.getAverageQuizScore()
                                )

                                .build()

                )

                .toList();
    }
}
