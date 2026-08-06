package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Coordinates the configured AI providers: attempts them in bean order and
 * fails over to the next one when a provider rejects the call entirely
 * (e.g. every configured model is rate-limited or unreachable).
 *
 * <p>The registry deliberately does <em>not</em> implement {@link AiProvider}
 * — it is a composite of providers, not a vendor port — so that Spring can
 * resolve {@code List<AiProvider>} here without the registry being its own
 * member (which would create an injection cycle).
 */
@Component
@Slf4j
public class AiProviderRegistry {

    private final List<AiProvider> providers;

    public AiProviderRegistry(List<AiProvider> providers) {
        this.providers = providers;
    }

    /**
     * Completes a prompt through the first healthy provider. When a provider
     * throws (rate limit on all its models, transport failure, contract
     * error), the next provider is tried; if every provider fails, the last
     * failure is rethrown so callers observe a single error shape.
     */
    public AiCompletionResult complete(String prompt) {

        if (providers.isEmpty()) {
            throw new AIServiceException(
                    "No AI providers are configured."
            );
        }

        AIServiceException lastFailure = null;

        for (AiProvider provider : providers) {

            try {

                AiCompletionResult result = provider.completeWithMetadata(prompt);

                if (result.text() == null || result.text().isBlank()) {
                    throw new AIServiceException(
                            "Provider " + provider.providerName()
                                    + " returned an empty completion."
                    );
                }

                return result;

            } catch (AIServiceException ex) {

                lastFailure = ex;

                log.warn(
                        "AI provider {} failed; failing over to the next provider: {}",
                        provider.providerName(),
                        ex.getMessage()
                );
            }
        }

        throw lastFailure;
    }
}