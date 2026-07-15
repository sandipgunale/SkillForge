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
public class TopicSummaryDto {

    private String topicId;

    private String topicName;

    private BigDecimal averageScore;

    private Integer quizzesTaken;

    private Integer minutesSpent;

}