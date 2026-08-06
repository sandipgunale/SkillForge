package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Gemini AI provider configuration ({@code gemini.*}).
 *
 * <p>{@code models} is a comma-separated list in the property file; it binds
 * as a {@link List} and is rotated through by the client on HTTP 429.
 */
@Validated
@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(
        @NotBlank(message = "gemini.api-key (GEMINI_API_KEY) must be set") String apiKey,
        @NotEmpty(message = "gemini.models must list at least one model") List<String> models,
        @DecimalMin(value = "0.0", message = "gemini.temperature must be >= 0")
        @DecimalMax(value = "1.0", message = "gemini.temperature must be <= 1")
        double temperature,
        @Positive int maxQuestionsPerDay,
        @PositiveOrZero int maxParseRetries,
        String baseUrl,
        @Positive int connectTimeoutMs,
        @Positive int readTimeoutMs,
        @Positive int retryDelayMaxSeconds,
        @Positive int transportRetrySleepSeconds
) {
}
