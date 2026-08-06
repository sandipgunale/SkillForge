package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiProviderRegistryTest {

    private static AiCompletionResult result(String provider) {
        return new AiCompletionResult("text", "model-1", provider, 10, 5, 12L);
    }

    @Test
    void returnsFirstHealthyProviderResult() {
        AiProvider p1 = mock(AiProvider.class);
        AiProvider p2 = mock(AiProvider.class);
        when(p1.completeWithMetadata(anyString())).thenReturn(result("p1"));

        AiProviderRegistry registry = new AiProviderRegistry(List.of(p1, p2));

        AiCompletionResult actual = registry.complete("prompt");

        assertEquals("p1", actual.provider());
        verify(p2, never()).completeWithMetadata(anyString());
    }

    @Test
    void failsOverToNextProvider() {
        AiProvider p1 = mock(AiProvider.class);
        AiProvider p2 = mock(AiProvider.class);
        when(p1.completeWithMetadata(anyString()))
                .thenThrow(new AIServiceException("rate limited on all models"));
        when(p2.completeWithMetadata(anyString())).thenReturn(result("p2"));

        AiProviderRegistry registry = new AiProviderRegistry(List.of(p1, p2));

        assertEquals("p2", registry.complete("prompt").provider());
    }

    @Test
    void rethrowsLastFailureWhenAllProvidersFail() {
        AiProvider p1 = mock(AiProvider.class);
        AiProvider p2 = mock(AiProvider.class);
        when(p1.completeWithMetadata(anyString()))
                .thenThrow(new AIServiceException("provider one down"));
        when(p2.completeWithMetadata(anyString()))
                .thenThrow(new AIServiceException("provider two down"));

        AiProviderRegistry registry = new AiProviderRegistry(List.of(p1, p2));

        AIServiceException ex = assertThrows(AIServiceException.class,
                () -> registry.complete("prompt"));
        assertEquals("provider two down", ex.getMessage());
    }

    @Test
    void rejectsEmptyCompletionsAndFailsOver() {
        AiProvider p1 = mock(AiProvider.class);
        AiProvider p2 = mock(AiProvider.class);
        when(p1.completeWithMetadata(anyString()))
                .thenReturn(new AiCompletionResult("  ", "m", "p1", null, null, 1L));
        when(p2.completeWithMetadata(anyString())).thenReturn(result("p2"));

        AiProviderRegistry registry = new AiProviderRegistry(List.of(p1, p2));

        assertEquals("p2", registry.complete("prompt").provider());
    }

    @Test
    void failsWhenNoProvidersConfigured() {
        AiProviderRegistry registry = new AiProviderRegistry(List.of());

        assertThrows(AIServiceException.class, () -> registry.complete("prompt"));
    }
}
