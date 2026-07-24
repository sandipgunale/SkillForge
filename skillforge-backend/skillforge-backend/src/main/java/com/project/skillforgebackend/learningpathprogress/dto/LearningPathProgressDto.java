package com.project.skillforgebackend.learningpathprogress.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class LearningPathProgressDto {

    private UUID id;

    private UUID learningPathId;

    private String learningPathTitle;

    private List<Integer> completedWeeks;

    private Short completionPercentage;

    private Integer quizzesTaken;

    private BigDecimal averageQuizScore;

    private Integer minutesSpent;

    private LocalDateTime lastActivityAt;

}