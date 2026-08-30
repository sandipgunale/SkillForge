package com.project.skillforgebackend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * OpenAI provider configuration ({@code openai.*}).
 *
 * <p>Intentionally lenient (no {@code @Validated} / {@code @NotBlank}): the
 * provider is optional and only participates in the failover registry when a
 * key is present. When the key is blank the client throws
 * {@link com.project.skillforgebackend.ai.exception.AIServiceException} at
 * call time so the registry skips it and falls through to the next provider.
 *
 * <p>{@code models} is a comma-separated list; the client rotates through it
 * on HTTP 429 / 5xx, mirroring {@link GeminiProperties}.
 */
@ConfigurationProperties(prefix = "openai")
public record OpenAiProperties(
        String apiKey,
        List<String> models,
        Double temperature,
        String baseUrl,
        Integer connectTimeoutMs,
        Integer readTimeoutMs,
        Integer retryDelayMaxSeconds,
        Integer transportRetrySleepSeconds
) {
}
