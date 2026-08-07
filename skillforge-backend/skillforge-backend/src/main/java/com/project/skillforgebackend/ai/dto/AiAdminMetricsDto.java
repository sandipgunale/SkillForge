package com.project.skillforgebackend.ai.dto;

/**
 * Aggregated observations for the admin AI console.
 *
 * @param circuitBreakerState   OPEN / CLOSED / HALF_OPEN of the AI backend
 * @param circuitFailureRate    current failure rate percentage (NaN when
 *                              insufficient samples)
 * @param totalCalls            total completed AI calls (success + failure)
 * @param successfulCalls       completed calls that returned text
 * @param failedCalls           calls that surfaced an error
 * @param models                per provider/model breakdown
 * @param cacheRequestCount     learning-path cache lookups
 * @param cacheHitCount         cache lookups satisfied from cache
 * @param cacheMissCount        cache lookups that forwarded to the provider
 */
public record AiAdminMetricsDto(
        String circuitBreakerState,
        float circuitFailureRate,
        long totalCalls,
        long successfulCalls,
        long failedCalls,
        java.util.List<AiModelMetricDto> models,
        long cacheRequestCount,
        long cacheHitCount,
        long cacheMissCount
) {
}