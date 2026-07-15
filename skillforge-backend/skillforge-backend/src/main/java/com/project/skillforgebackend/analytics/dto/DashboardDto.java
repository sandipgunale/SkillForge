package com.project.skillforgebackend.analytics.dto;

import com.project.skillforgebackend.analytics.enums.LearningLevel;
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

    /**
     * Formatted study time.
     * Example:
     * 2h 35m
     */
    private String studyHours;

    private Integer totalTopicsStarted;

    /**
     * Overall learning health score.
     */
    private Integer learningHealthScore;

    private Integer totalQuizzesTaken;

    private Integer averageMinutesPerTopic;

    private Integer completedTopics;

    private LearningLevel learningLevel;

    private String mostActiveTopic;

    private BigDecimal overallAverageScore;

    private BigDecimal quizAccuracy;

    /**
     * Best performing topic.
     */
    private TopicSummaryDto bestTopic;

    /**
     * Lowest performing topic.
     */
    private TopicSummaryDto worstTopic;

    /**
     * Last completed quiz.
     */
    private LastQuizDto lastQuiz;

    /**
     * Personalized dashboard recommendations.
     */
    private List<RecommendationDto> recommendations;

    /**
     * Weekly learning activity
     */
    private List<WeeklyActivityDto> weeklyActivity;


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

    /**
     * Indicates whether the user currently has weak areas.
     */
    private Boolean hasWeakAreas;

}