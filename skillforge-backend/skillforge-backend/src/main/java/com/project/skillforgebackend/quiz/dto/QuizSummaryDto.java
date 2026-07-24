package com.project.skillforgebackend.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSummaryDto {

    private int score;

    private int maxScore;

    private double percentage;

    /**
     * Future:
     * A+, A, B...
     */
    private String grade;

    /**
     * Future:
     * Duration taken by user.
     */
    private Long durationInSeconds;

}