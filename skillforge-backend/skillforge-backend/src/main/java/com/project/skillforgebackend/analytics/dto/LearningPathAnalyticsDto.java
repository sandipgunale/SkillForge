package com.project.skillforgebackend.analytics.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathAnalyticsDto {

    private String learningPathId;

    private String learningPathTitle;

    private Short completionPercentage;

    private Integer quizzesTaken;

    private Integer minutesSpent;

    private BigDecimal averageQuizScore;

}