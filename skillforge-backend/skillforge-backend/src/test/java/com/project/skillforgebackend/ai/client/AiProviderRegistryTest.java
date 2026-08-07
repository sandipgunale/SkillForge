package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiProviderRegistryTest {

    private AiProvider primary;
    private AiProvider fallback;

    @BeforeEach
    void setUp() {
        primary = mock(AiProvider.class);
        fallback = mock(AiProvider.class);
    }

    @Test
    void returnsFirstHealthyProvider() {
        AiCompletionResult expected = new AiCompletionResult(
                "text", "model-a", "primary", 1, 2, 5L);

        when(primary.providerName()).thenReturn("primary");
        when(primary.completeWithMetadata("prompt")).thenReturn(expected);

        AiProviderRegistry registry = new AiProviderRegistry(List.of(primary, fallback));

        AiCompletionResult result = registry.complete("prompt");

        assertThat(result).isEqualTo(expected);
        verify(fallback, never()).completeWithMetadata("prompt");
    }

    @Test
    void failsOverWhenPrimaryThrows() {
        AiCompletionResult expected = new AiCompletionResult(
                "text", "model-b", "fallback", 3, 4, 7L);

        when(primary.providerName()).thenReturn("primary");
        when(primary.completeWithMetadata("prompt"))
                .thenThrow(new AIServiceException("primary down"));
        when(fallback.providerName()).thenReturn("fallback");
        when(fallback.completeWithMetadata("prompt")).thenReturn(expected);

        AiProviderRegistry registry = new AiProviderRegistry(List.of(primary, fallback));

        assertThat(registry.complete("prompt")).isEqualTo(expected);
    }

    @Test
    void rejectsEmptyCompletionAndFailsOver() {
        AiCompletionResult empty = new AiCompletionResult(
                "   ", "model-a", "primary", null, null, 5L);
        AiCompletionResult good = new AiCompletionResult(
                "text", "model-b", "fallback", 1, 2, 6L);

        when(primary.providerName()).thenReturn("primary");
        when(primary.completeWithMetadata("prompt")).thenReturn(empty);
        when(fallback.providerName()).thenReturn("fallback");
        when(fallback.completeWithMetadata("prompt")).thenReturn(good);

        AiProviderRegistry registry = new AiProviderRegistry(List.of(primary, fallback));

        assertThat(registry.complete("prompt")).isEqualTo(good);
    }

    @Test
    void rethrowsLastFailureWhenAllFail() {
        when(primary.providerName()).thenReturn("primary");
        when(primary.completeWithMetadata("prompt"))
                .thenThrow(new AIServiceException("primary down"));
        when(fallback.providerName()).thenReturn("fallback");
        when(fallback.completeWithMetadata("prompt"))
                .thenThrow(new AIServiceException("fallback down"));

        AiProviderRegistry registry = new AiProviderRegistry(List.of(primary, fallback));

        assertThatThrownBy(() -> registry.complete("prompt"))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("fallback down");
    }

    @Test
    void rejectsNoConfiguredProviders() {
        AiProviderRegistry registry = new AiProviderRegistry(List.of());

        assertThatThrownBy(() -> registry.complete("prompt"))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("No AI providers are configured");
    }
}