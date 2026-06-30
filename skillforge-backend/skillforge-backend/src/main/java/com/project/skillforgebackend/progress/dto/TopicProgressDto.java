package com.project.skillforgebackend.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicProgressDto {

    private String topicId;

    private String topicName;

    private short completionPercentage;

    private Integer quizzesTaken;

    private Integer minutesSpent;

    private BigDecimal averageScore;

}