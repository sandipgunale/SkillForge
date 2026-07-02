package com.project.skillforgebackend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicAnalyticsDto {

    /**
     * Topic Information
     */
    private String topicId;

    private String topicName;

    /**
     * Learning Progress
     */
    private Short completionPercentage;

    private Integer quizzesTaken;

    private Integer minutesSpent;

    /**
     * Performance
     */
    private BigDecimal averageScore;

}