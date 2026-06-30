package com.project.skillforgebackend.progress.dto;

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
public class ProgressDto {

    private Integer totalTopics;

    private Integer completedTopics;

    private Integer totalQuizzesTaken;

    private Integer totalMinutesSpent;

    private BigDecimal overallAverageScore;

    private List<TopicProgressDto> topics;

}