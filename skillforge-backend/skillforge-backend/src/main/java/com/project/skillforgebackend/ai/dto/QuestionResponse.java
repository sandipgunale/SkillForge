package com.project.skillforgebackend.ai.dto;

import com.project.skillforgebackend.quiz.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Question.QuestionType type;

    private String content;

    private List<String> options;

    private String correctAnswer;

    private Integer orderIndex;

}