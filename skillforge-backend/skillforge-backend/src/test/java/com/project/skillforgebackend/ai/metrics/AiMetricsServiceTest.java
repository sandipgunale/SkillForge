package com.project.skillforgebackend.ai.metrics;

import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.AiModelMetricDto;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.caffeine.CaffeineCacheManager;

import static org.assertj.core.api.Assertions.assertThat;

class AiMetricsServiceTest {

    private MeterRegistry meterRegistry;
    private AiMetricsService service;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        service = new AiMetricsService(
                meterRegistry,
                CircuitBreaker.ofDefaults("test-cb"),
                new CaffeineCacheManager()
        );
    }

    private Counter call(String provider, String model, String outcome) {
        return Counter.builder("skillforge_ai_calls_total")
                .tag("provider", provider)
                .tag("model", model)
                .tag("outcome", outcome)
                .register(meterRegistry);
    }

    @Test
    void aggregatesCallsPerModel() {
        call("gemini", "gemini-1.5", "success").increment(3);
        call("gemini", "gemini-1.5", "failure").increment(2);
        call("gemini", "gemini-2.0", "success").increment(4);
        call("other", "model-x", "success").increment(1);

        AiAdminMetricsDto metrics = service.metrics();

        assertThat(metrics.totalCalls()).isEqualTo(10);
        assertThat(metrics.successfulCalls()).isEqualTo(8);
        assertThat(metrics.failedCalls()).isEqualTo(2);

        assertThat(metrics.models()).hasSize(3);

        AiModelMetricDto gemini15 = metrics.models().stream()
                .filter(m -> "gemini-1.5".equals(m.model()))
                .findFirst()
                .orElseThrow();

        assertThat(gemini15.successfulCalls()).isEqualTo(3);
        assertThat(gemini15.failedCalls()).isEqualTo(2);
    }

    @Test
    void normalisesModelsWithoutTokens() {
        call("gemini", "gemini-1.5", "success").increment(1);

        AiModelMetricDto row = service.metrics().models().get(0);

        assertThat(row.promptTokens()).isZero();
        assertThat(row.completionTokens()).isZero();
    }

    @Test
    void reportsCircuitBreakerState() {
        CircuitBreaker circuit = CircuitBreaker.ofDefaults("other-cb");
        service = new AiMetricsService(meterRegistry, circuit, new CaffeineCacheManager());

        assertThat(service.metrics().circuitBreakerState())
                .isEqualTo("CLOSED");
    }
}