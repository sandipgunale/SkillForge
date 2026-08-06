package com.project.skillforgebackend.ai.dto;

import java.util.List;
import java.util.Map;

/**
 * Read model for the admin AI dashboard.
 *
 * @param calls                 total calls grouped by outcome (success/failure)
 * @param callDurationSeconds   mean wall-clock call duration per outcome
 * @param promptTokens          reported input tokens (provider-dependent)
 * @param completionTokens      reported output tokens (provider-dependent)
 * @param configuredModels      models configured for the primary provider
 * @param circuitBreaker        resilience4j circuit breaker snapshot
 * @param learningPathCache     response-cache statistics
 */
public record AiAdminMetricsDto(
        Map<String, Long> calls,
        Map<String, Double> callDurationSeconds,
        long promptTokens,
        long completionTokens,
        List<String> configuredModels,
        CircuitBreakerSnapshot circuitBreaker,
        CacheSnapshot learningPathCache
) {
}