package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Auth endpoint rate limiting ({@code security.rate-limit.*}) plus AI
 * endpoint rate limiting ({@code security.rate-limit.ai.*}). Single-node
 * token buckets; each limiter refuses requests when disabled is false or the
 * budget for the window is exhausted.
 */
@Validated
@ConfigurationProperties(prefix = "security.rate-limit")
public record RateLimitProperties(
        boolean enabled,
        @Positive int maxRequests,
        @Positive long windowMinutes,
        Ai ai
) {

    public record Ai(
            boolean enabled,
            @Positive int maxRequests,
            @Positive long windowMinutes
    ) {
    }
}
