package com.project.skillforgebackend.ai.dto;

/**
 * Per provider+model AI call breakdown for the admin console.
 *
 * @param provider            provider id (e.g. {@code gemini})
 * @param model               model name as reported by the provider
 * @param successfulCalls     calls that returned text
 * @param failedCalls         calls that surfaced an error
 * @param averageDurationMs   mean wall-clock duration of successful calls
 * @param promptTokens        reported input token usage
 * @param completionTokens    reported output token usage
 */
public record AiModelMetricDto(
        String provider,
        String model,
        long successfulCalls,
        long failedCalls,
        double averageDurationMs,
        long promptTokens,
        long completionTokens
) {
}