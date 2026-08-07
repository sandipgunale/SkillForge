package com.project.skillforgebackend.ai.dto;

/**
 * Result of an admin playground submission.
 *
 * @param completion         generated text
 * @param provider           provider that served the completion
 * @param model              model that produced the text
 * @param promptTokens       reported input tokens (null if unknown)
 * @param completionTokens   reported output tokens (null if unknown)
 * @param latencyMillis      wall-clock latency of the completion
 */
public record AiPlaygroundResponse(
        String completion,
        String provider,
        String model,
        Integer promptTokens,
        Integer completionTokens,
        long latencyMillis
) {
}