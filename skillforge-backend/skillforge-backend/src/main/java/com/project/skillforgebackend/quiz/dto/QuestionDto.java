package com.project.skillforgebackend.quiz.dto;

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
public class QuestionDto {

    private String id;

    private Question.QuestionType type;

    private String content;

    /**
     * JSON string containing MCQ options.
     * Example:
     * ["Java","Python","C++","Go"]
     */
    private List<String> options;

    private int orderIndex;

    /**
     * The user's saved answer, present when the quiz is being resumed.
     */
    private String userAnswer;

}