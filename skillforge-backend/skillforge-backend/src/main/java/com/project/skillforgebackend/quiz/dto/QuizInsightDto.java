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
public class QuizInsightDto {

    private String overallFeedback;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> improvements;

}