package com.project.skillforgebackend.ai.resilience;

import com.project.skillforgebackend.ai.client.AiCompletionResult;
import com.project.skillforgebackend.ai.client.AiProviderRegistry;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiResilienceExecutorTest {

    private AiProviderRegistry registry;
    private AiResilienceExecutor executor;

    @BeforeEach
    void setUp() {
        registry = mock(AiProviderRegistry.class);
        executor = new AiResilienceExecutor(
                registry,
                CircuitBreaker.ofDefaults("test-cb"),
                Retry.ofDefaults("test-retry"),
                TimeLimiter.of(Duration.ofSeconds(5)),
                Executors.newSingleThreadExecutor(),
                Executors.newSingleThreadScheduledExecutor(),
                new SimpleMeterRegistry()
        );
    }

    @Test
    void returnsCompletionText() {
        AiCompletionResult result = new AiCompletionResult(
                "finished", "model", "gemini", 10, 20, 3L);

        when(registry.complete("prompt")).thenReturn(result);

        assertThat(executor.complete("prompt")).isEqualTo("finished");
    }

    @Test
    void returnsCompletionWithMetadata() {
        AiCompletionResult result = new AiCompletionResult(
                "finished", "model-a", "gemini", 10, 20, 3L);

        when(registry.complete("prompt")).thenReturn(result);

        AiCompletionResult actual =
                executor.completeWithMetadata("prompt");

        assertThat(actual).isEqualTo(result);
    }

    @Test
    void surfacesAiServiceFailureAsIs() {
        when(registry.complete("prompt"))
                .thenThrow(new AIServiceException("provider refused"));

        assertThatThrownBy(() -> executor.complete("prompt"))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("provider refused");
    }

    @Test
    void translatesUnknownRuntimeFailure() {
        when(registry.complete("prompt"))
                .thenThrow(new IllegalStateException("boom"));

        assertThatThrownBy(() -> executor.complete("prompt"))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("Failed to communicate");
    }
}