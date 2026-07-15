package com.project.skillforgebackend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastQuizDto {

    private String quizId;

    private String topicName;

    private Integer score;

    private Integer maxScore;

    private BigDecimal percentage;

    private LocalDateTime completedAt;

}