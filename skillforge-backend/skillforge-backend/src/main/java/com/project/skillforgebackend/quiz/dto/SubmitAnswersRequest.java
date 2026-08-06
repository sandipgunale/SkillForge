package com.project.skillforgebackend.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SubmitAnswersRequest {

    @Valid
    @NotEmpty(message = "Answers cannot be empty")
    @Size(max = 100, message = "Too many answers")
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {

        @NotNull(message = "Question Id is required")
        private UUID questionId;

        @Size(max = 2000, message = "Answer is too long")
        private String answer;

    }

}