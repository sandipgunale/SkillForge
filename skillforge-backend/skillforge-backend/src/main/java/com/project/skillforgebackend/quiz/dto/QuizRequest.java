package com.project.skillforgebackend.quiz.dto;

import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class QuizRequest {

    @NotNull(message = "Quiz source is required")
    private QuizSource source;

    // Required only for TOPIC quiz
    private UUID topicId;

    // Required only for LEARNING_PATH quiz
    private UUID learningPathId;

    private Integer weekNumber;

    @NotNull(message = "Difficulty is required")
    private Resource.Difficulty difficulty;

    @Min(value = 1, message = "Minimum 1 question required")
    @Max(value = 20, message = "Maximum 20 questions allowed")
    private int questionCount;

    private List<Question.QuestionType> questionTypes;

}