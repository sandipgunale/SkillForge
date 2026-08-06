package com.project.skillforgebackend.ai.client;

/**
 * Port for AI text-completion providers. The application depends on this
 * interface, never on a concrete vendor, so additional providers (or a
 * stub for tests/offline mode) can be plugged in without touching the
 * service layer.
 *
 * <p>Implementations must be thread-safe and must throw
 * {@link com.project.skillforgebackend.ai.exception.AIServiceException}
 * (or a subclass) for every failure path — transport errors, rate limits,
 * malformed payloads — so callers never see vendor exceptions.
 */
public interface AiProvider {

    /**
     * Sends a prompt and returns the generated text.
     *
     * @param prompt the full prompt payload
     * @return the generated text
     * @throws com.project.skillforgebackend.ai.exception.AIServiceException
     *         when the provider cannot fulfil the request
     */
    String complete(String prompt);

    /**
     * Sends a prompt and returns the generated text together with
     * provider/model identity and token usage. Defaults to the plain
     * completion with {@code null} token usage; providers that can read
     * usage metadata should override this.
     *
     * @param prompt the full prompt payload
     * @return a structured completion result
     * @throws com.project.skillforgebackend.ai.exception.AIServiceException
     *         when the provider cannot fulfil the request
     */
    default AiCompletionResult completeWithMetadata(String prompt) {
        long started = System.nanoTime();
        String text = complete(prompt);
        return new AiCompletionResult(
                text,
                null,
                getClass().getSimpleName(),
                null,
                null,
                (System.nanoTime() - started) / 1_000_000L
        );
    }

    /**
     * Stable, human-readable provider identifier used in metrics
     * and admin dashboards.
     */
    default String providerName() {
        return getClass().getSimpleName();
    }
}
