package com.project.skillforgebackend.quiz.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {

    private String quizId;

    private QuizSummaryDto summary;

    private QuizAnalyticsDto analytics;

    private QuizInsightDto insight;

    private List<QuestionResultDto> questions;

}