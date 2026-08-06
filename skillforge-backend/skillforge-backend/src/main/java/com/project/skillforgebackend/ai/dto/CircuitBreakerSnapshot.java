package com.project.skillforgebackend.ai.dto;

/**
 * Snapshot of the resilience4j circuit breaker guarding AI calls.
 *
 * @param state              e.g. CLOSED / OPEN / HALF_OPEN
 * @param failureRatePercent current failure rate ({@code -1} before enough
 *                           calls are recorded)
 * @param bufferedCalls      calls currently in the sliding window
 */
public record CircuitBreakerSnapshot(
        String state,
        float failureRatePercent,
        long bufferedCalls
) {
}