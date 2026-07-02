package com.project.skillforgebackend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {

    /**
     * Overall dashboard statistics
     */
    private Integer totalLearningMinutes;

    private Integer totalTopicsStarted;

    private Integer totalQuizzesTaken;

    private BigDecimal overallAverageScore;


    /**
     * Topic-wise analytics
     */
    private List<TopicAnalyticsDto> topicAnalytics;

    /**
     * Recent quiz performance
     */
    private List<QuizScoreDto> recentQuizScores;

    /**
     * Topics where user's average score is low
     */
    private List<String> weakAreas;

}