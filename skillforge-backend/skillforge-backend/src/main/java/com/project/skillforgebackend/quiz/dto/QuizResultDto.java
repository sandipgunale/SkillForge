package com.project.skillforgebackend.quiz.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {

    private String quizId;

    /**
     * True when the result was produced by Gemini.
     * False when it was graded offline by {@code QuizResultBuilder}
     * (Gemini unreachable) — scores are still accurate, but AI feedback
     * is template-generated.
     */
    @Builder.Default
    private boolean aiEvaluated = true;

    private QuizSummaryDto summary;

    private QuizAnalyticsDto analytics;

    private QuizInsightDto insight;

    private List<QuestionResultDto> questions;

}