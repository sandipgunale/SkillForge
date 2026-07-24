package com.project.skillforgebackend.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnalyticsDto {

    private int totalQuestions;

    private int answeredQuestions;

    private int correctAnswers;

    private int incorrectAnswers;

    private double accuracy;

}