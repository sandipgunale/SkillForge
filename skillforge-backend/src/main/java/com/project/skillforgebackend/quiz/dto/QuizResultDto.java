package com.project.skillforgebackend.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {

    private String quizId;

    private int score;

    private int maxScore;

    private double percentage;

    private String overallFeedback;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> improvements;

    private List<QuestionResultDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResultDto {

        private String questionId;

        private String content;

        private String correctAnswer;

        private String userAnswer;

        private boolean isCorrect;

        private String aiFeedback;

    }

}