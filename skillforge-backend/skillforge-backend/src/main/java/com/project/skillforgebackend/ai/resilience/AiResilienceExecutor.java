package com.project.skillforgebackend.ai.resilience;

import com.project.skillforgebackend.ai.client.AiCompletionResult;
import com.project.skillforgebackend.ai.client.AiProviderRegistry;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.decorators.Decorators;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeoutException;

/**
 * Runs outbound AI calls through the full resilience chain — circuit
 * breaker, retry for transient transport failures, wall-clock time limit —
 * and records duration, call-count and token metrics per outcome.
 *
 * <p>All failures surface as {@link AIServiceException} so callers never
 * depend on resilience4j types. Owns the pieces of the chain that used to
 * live in the service layer, keeping {@code AIService} focused on prompt
 * building and parsing.
 */
@Component
@Slf4j
public class AiResilienceExecutor {

    private final AiProviderRegistry providerRegistry;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;
    private final TimeLimiter timeLimiter;
    private final ExecutorService executor;
    private final ScheduledExecutorService timeoutScheduler;
    private final MeterRegistry meterRegistry;

    public AiResilienceExecutor(
            AiProviderRegistry providerRegistry,
            CircuitBreaker circuitBreaker,
            Retry retry,
            TimeLimiter timeLimiter,
            @Qualifier("aiExecutor") ExecutorService executor,
            @Qualifier("aiTimeoutScheduler") ScheduledExecutorService timeoutScheduler,
            MeterRegistry meterRegistry) {
        this.providerRegistry = providerRegistry;
        this.circuitBreaker = circuitBreaker;
        this.retry = retry;
        this.timeLimiter = timeLimiter;
        this.executor = executor;
        this.timeoutScheduler = timeoutScheduler;
        this.meterRegistry = meterRegistry;
    }

    public String complete(String prompt) {

        Timer.Sample sample = Timer.start(meterRegistry);

        try {

            AiCompletionResult result = executeResilientCall(prompt);

            sample.stop(aiCallTimer(
                    result.provider(),
                    result.model(),
                    "success"
            ));

            recordTokens(result);

            return result.text();

        } catch (AIServiceException ex) {

            sample.stop(aiCallTimer("unknown", "unknown", "failure"));

            counter("failure", "unknown", "unknown").increment();

            throw ex;

        } catch (RuntimeException ex) {

            sample.stop(aiCallTimer("unknown", "unknown", "failure"));

            counter("failure", "unknown", "unknown").increment();

            throw translateAiFailure(unwrap(ex));

        }
    }

    private Timer aiCallTimer(String provider, String model, String outcome) {
        return Timer.builder("skillforge_ai_call_duration")
                .description("Wall-clock duration of an outbound AI call")
                .tag("provider", provider)
                .tag("model", model == null ? "unknown" : model)
                .tag("outcome", outcome)
                .register(meterRegistry);
    }

    private Counter counter(String outcome, String provider, String model) {
        return Counter.builder("skillforge_ai_calls_total")
                .description("Number of outbound AI calls by outcome")
                .tag("provider", provider)
                .tag("model", model == null ? "unknown" : model)
                .tag("outcome", outcome)
                .register(meterRegistry);
    }

    /**
     * Records reported token usage (input/output) so the admin dashboard
     * can track provider cost, not just call counts.
     */
    private void recordTokens(AiCompletionResult result) {

        if (!result.hasTokenUsage()) {
            return;
        }

        Counter.builder("skillforge_ai_tokens_total")
                .description("Reported AI token usage")
                .tag("provider", result.provider())
                .tag("model", result.model() == null ? "unknown" : result.model())
                .tag("direction", "prompt")
                .register(meterRegistry)
                .increment(result.promptTokens());

        Counter.builder("skillforge_ai_tokens_total")
                .description("Reported AI token usage")
                .tag("provider", result.provider())
                .tag("model", result.model() == null ? "unknown" : result.model())
                .tag("direction", "completion")
                .register(meterRegistry)
                .increment(result.completionTokens());
    }

    private AiCompletionResult executeResilientCall(String prompt) {

        java.util.function.Supplier<AiCompletionResult> call = Retry.decorateSupplier(
                retry,
                CircuitBreaker.decorateSupplier(
                        circuitBreaker,
                        () -> providerRegistry.complete(prompt)
                )
        );

        return Decorators.ofCompletionStage(
                        () -> CompletableFuture.supplyAsync(call, executor)
                )
                .withTimeLimiter(timeLimiter, timeoutScheduler)
                .get()
                .toCompletableFuture()
                .join();
    }

    private Throwable unwrap(Throwable throwable) {

        Throwable current = throwable;

        while ((current instanceof CompletionException)
                && current.getCause() != null) {

            current = current.getCause();
        }

        return current;
    }

    private AIServiceException translateAiFailure(Throwable cause) {

        if (cause instanceof AIServiceException aiException) {

            return aiException;
        }

        if (cause instanceof CallNotPermittedException) {

            log.warn("AI circuit breaker open; rejecting call.");

            return new AIServiceException(
                    "The AI service is temporarily unavailable. "
                            + "Please try again later.",
                    cause
            );
        }

        if (cause instanceof TimeoutException) {

            log.warn("AI call timed out after the configured limit.");

            return new AIServiceException(
                    "The AI service took too long to respond. "
                            + "Please try again later.",
                    cause
            );
        }

        return new AIServiceException(
                "Failed to communicate with the AI service.",
                cause
        );
    }
}