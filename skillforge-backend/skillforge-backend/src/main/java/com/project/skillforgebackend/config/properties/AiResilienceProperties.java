package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Resilience strategy for outbound AI calls ({@code ai.resilience.*}).
 *
 * <p>All values are configurable via environment/properties; defaults match
 * the behaviour the circuit breaker, retry and time limiter had when they
 * were hard-coded in {@code ResilienceConfig}.
 */
@Validated
@ConfigurationProperties(prefix = "ai.resilience")
public record AiResilienceProperties(
        @Positive int circuitBreakerSlidingWindowSize,
        @Positive int circuitBreakerMinimumCalls,
        @Min(1) @Max(100) int circuitBreakerFailureRateThreshold,
        @Positive long circuitBreakerWaitOpenSeconds,
        @Positive int circuitBreakerHalfOpenCalls,
        @Positive int retryMaxAttempts,
        @Positive long retryInitialBackoffMillis,
        @Min(1) @Max(10) double retryBackoffMultiplier,
        @Positive long retryMaxBackoffMillis,
        @Positive long timeLimiterSeconds,
        @Positive int executorThreads
) {
}
