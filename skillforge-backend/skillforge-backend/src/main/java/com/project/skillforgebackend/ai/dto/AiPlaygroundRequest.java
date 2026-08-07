package com.project.skillforgebackend.ai.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Raw prompt submission from the admin AI playground. Admin-only endpoint;
 * still bounded by {@code ai.service.max-playground-prompt-length}.
 */
public record AiPlaygroundRequest(
        @NotBlank(message = "prompt must not be blank") String prompt
) {
}
