package com.project.skillforgebackend.ai.client;

/**
 * Structured result of a single AI completion, carrying the generated text
 * plus provider/model identity and (when reported) token usage so the
 * resilience and observability layers can emit accurate metrics without
 * depending on a vendor-specific response format.
 *
 * <p><b>Backwards compatibility:</b> providers that cannot report token
 * usage return {@code null} token fields; consumers treat that as
 * "usage unknown" rather than an error.
 *
 * @param text               the generated text
 * @param model              the model that produced the text
 * @param provider           stable id of the provider (e.g. {@code gemini})
 * @param promptTokens       input tokens, or {@code null} if not reported
 * @param completionTokens   output tokens, or {@code null} if not reported
 * @param latencyMillis      wall-clock latency of the provider call
 */
public record AiCompletionResult(
        String text,
        String model,
        String provider,
        Integer promptTokens,
        Integer completionTokens,
        long latencyMillis
) {

    public boolean hasTokenUsage() {
        return promptTokens != null && completionTokens != null;
    }
}