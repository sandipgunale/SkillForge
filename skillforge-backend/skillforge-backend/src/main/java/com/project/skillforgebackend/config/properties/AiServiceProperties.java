package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Cross-cutting AI subsystem behaviour ({@code ai.service.*}): prompt
 * caching, prompt-injection guardrails, and playground constraints for the
 * admin AI console.
 */
@Validated
@ConfigurationProperties(prefix = "ai.service")
public record AiServiceProperties(
        boolean cacheEnabled,
        @Min(1) @Positive int maxFieldLength,
        @Min(1) @Positive int maxPromptLength,
        @Min(1) @Positive int maxQuestionsPerRequest,
        @Min(1) @Positive int maxPlaygroundPromptLength
) {
}
