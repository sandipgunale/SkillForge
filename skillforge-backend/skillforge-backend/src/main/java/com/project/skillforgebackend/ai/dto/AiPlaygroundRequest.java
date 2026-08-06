package com.project.skillforgebackend.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Admin AI playground request: an arbitrary prompt run through the real
 * provider chain (background: registry, resilience executor) and reported
 * back with the model/latency that produced it.
 *
 * @param prompt the raw prompt to send
 */
public record AiPlaygroundRequest(
        @NotBlank(message = "prompt must not be blank")
        @Size(max = 100000, message = "prompt is too large")
        String prompt
) {
}