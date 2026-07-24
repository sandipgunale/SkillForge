package com.project.skillforgebackend.quiz.dto;

import com.project.skillforgebackend.quiz.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResultDto {

    private String questionId;

    /**
     * MCQ
     * CODING
     * INTERVIEW
     * SCENARIO
     */
    private Question.QuestionType questionType;

    private String content;

    /**
     * Temporary.
     * Will later become type-specific.
     */
    private String correctAnswer;

    private String userAnswer;

    private boolean correct;

    private String aiFeedback;

}