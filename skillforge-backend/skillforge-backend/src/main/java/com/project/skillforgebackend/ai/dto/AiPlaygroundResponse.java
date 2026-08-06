package com.project.skillforgebackend.ai.dto;

/**
 * Result of an admin AI playground call.
 *
 * @param text              the generated text
 * @param provider          provider that produced it
 * @param model             model that produced it
 * @param latencyMillis     wall-clock latency of the provider call
 * @param promptTokens      reported input tokens, or null when unknown
 * @param completionTokens  reported output tokens, or null when unknown
 */
public record AiPlaygroundResponse(
        String text,
        String provider,
        String model,
        long latencyMillis,
        Integer promptTokens,
        Integer completionTokens
) {
}