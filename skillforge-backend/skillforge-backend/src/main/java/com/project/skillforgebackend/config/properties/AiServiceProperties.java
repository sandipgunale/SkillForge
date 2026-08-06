package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * AI subsystem service settings ({@code ai.service.*}): the prompt-guard
 * (injection defence and input sanity limits) and the deterministic
 * learning-path response cache.
 */
@Validated
@ConfigurationProperties(prefix = "ai.service")
public record AiServiceProperties(
        boolean cacheEnabled,
        boolean guardEnabled,
        @Positive int maxFieldLength,
        @Positive int maxPromptLength,
        @Positive @Max(500) int maxQuestionCount
) {
}