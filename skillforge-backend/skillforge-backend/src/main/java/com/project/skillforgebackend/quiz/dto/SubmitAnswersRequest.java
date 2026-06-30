package com.project.skillforgebackend.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SubmitAnswersRequest {

    @Valid
    @NotNull(message = "Answers cannot be null")
    @NotEmpty(message = "Answers cannot be empty")
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {

        @NotNull(message = "Question Id is required")
        private UUID questionId;

        private String answer;

    }

}