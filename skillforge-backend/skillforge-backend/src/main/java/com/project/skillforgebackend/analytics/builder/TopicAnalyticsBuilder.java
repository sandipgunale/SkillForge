package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.dto.RecommendationDto;
import com.project.skillforgebackend.analytics.dto.TopicAnalyticsDto;
import com.project.skillforgebackend.analytics.dto.TopicSummaryDto;
import com.project.skillforgebackend.analytics.enums.RecommendationPriority;
import com.project.skillforgebackend.progress.entity.Progress;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Topic-level analytics of the dashboard: per-topic rows, best/worst topic,
 * weak areas and follow-up recommendations.
 */
@Component
public class TopicAnalyticsBuilder {

    public TopicAnalyticsParts build(List<Progress> progressList) {

        List<TopicAnalyticsDto> topicAnalytics =
                progressList.stream()

                        .sorted(

                                Comparator

                                        .comparing(

                                                Progress::getAverageScore

                                        )

                                        .reversed()

                                        .thenComparing(

                                                Progress::getMinutesSpent,

                                                Comparator.reverseOrder()

                                        )

                        )

                        .map(this::toTopicAnalytics)

                        .toList();

        TopicSummaryDto bestTopic = progressList.stream()
                .max(Comparator.comparing(Progress::getAverageScore))
                .map(this::toTopicSummary)
                .orElse(null);

        TopicSummaryDto worstTopic = progressList.stream()
                .filter(progress -> progress.getQuizzesTaken() > 0)
                .min(Comparator.comparing(Progress::getAverageScore))
                .map(this::toTopicSummary)
                .orElse(null);

        List<String> weakAreas =
                progressList.stream()
                        .filter(progress ->
                                progress.getQuizzesTaken() > 0
                                        && progress.getAverageScore()
                                        .compareTo(BigDecimal.valueOf(60)) < 0
                        )
                        .map(progress ->
                                progress.getTopic().getName()
                        )
                        .toList();

        List<RecommendationDto> recommendations =
                buildRecommendations(progressList);

        return new TopicAnalyticsParts(
                topicAnalytics,
                bestTopic,
                worstTopic,
                weakAreas,
                recommendations
        );
    }

    private TopicAnalyticsDto toTopicAnalytics(Progress progress) {

        return TopicAnalyticsDto.builder()
                .topicId(progress.getTopic().getId().toString())
                .topicName(progress.getTopic().getName())
                .completionPercentage(progress.getCompletionPercentage())
                .quizzesTaken(progress.getQuizzesTaken())
                .minutesSpent(progress.getMinutesSpent())
                .averageScore(progress.getAverageScore())
                .build();
    }

    private TopicSummaryDto toTopicSummary(Progress progress) {

        return TopicSummaryDto.builder()
                .topicId(progress.getTopic().getId().toString())
                .topicName(progress.getTopic().getName())
                .averageScore(progress.getAverageScore())
                .minutesSpent(progress.getMinutesSpent())
                .quizzesTaken(progress.getQuizzesTaken())
                .build();
    }

    private List<RecommendationDto> buildRecommendations(
            List<Progress> progressList
    ) {

        List<RecommendationDto> recommendations = new ArrayList<>();

        progressList.stream()

                .filter(progress ->

                        progress.getAverageScore()

                                .compareTo(BigDecimal.valueOf(60)) < 0

                )

                .forEach(progress ->

                        recommendations.add(

                                RecommendationDto.builder()

                                        .title(

                                                "Practice "

                                                        + progress.getTopic().getName()

                                        )

                                        .reason(

                                                "Average score below 60%"

                                        )

                                        .priority(

                                                RecommendationPriority.HIGH

                                        )

                                        .build()

                        )

                );

        progressList.stream()

                .filter(progress -> progress.getCompletionPercentage() < 100)
                .sorted(
                        Comparator.comparing(
                                Progress::getCompletionPercentage
                        )
                )
                .limit(2)

                .forEach(progress ->

                        recommendations.add(

                                RecommendationDto.builder()

                                        .title(

                                                "Continue "

                                                        + progress.getTopic().getName()

                                        )

                                        .reason(

                                                "Topic not completed yet"

                                        )

                                        .priority(

                                                RecommendationPriority.MEDIUM

                                        )

                                        .build()

                        )

                );

        if (recommendations.isEmpty()) {

            recommendations.add(

                    RecommendationDto.builder()

                            .title(

                                    "Explore Advanced Topics"

                            )

                            .reason(

                                    "Excellent progress!"

                            )

                            .priority(

                                    RecommendationPriority.LOW

                            )

                            .build()

            );

        }

        return recommendations;
    }

    public record TopicAnalyticsParts(
            List<TopicAnalyticsDto> topicAnalytics,
            TopicSummaryDto bestTopic,
            TopicSummaryDto worstTopic,
            List<String> weakAreas,
            List<RecommendationDto> recommendations
    ) {
    }
}
