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
public class QuestionDto {

    private String id;

    private Question.QuestionType type;

    private String content;

    /**
     * JSON string containing MCQ options.
     * Example:
     * ["Java","Python","C++","Go"]
     */
    private String optionsJson;

    private int orderIndex;

}