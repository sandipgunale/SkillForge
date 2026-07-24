package com.project.skillforgebackend.learningpath.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWeekCompletionRequest {

    @NotNull(message = "Completed status is required.")
    private Boolean completed;

}