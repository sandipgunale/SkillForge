package com.project.skillforgebackend.ai.admin;

import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.CacheSnapshot;
import com.project.skillforgebackend.ai.dto.CircuitBreakerSnapshot;
import com.project.skillforgebackend.config.properties.GeminiProperties;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Composes the admin AI dashboard view from live infrastructure:
 * micrometer counters/timers recorded by {@code AiResilienceExecutor}, the
 * circuit breaker state, and the learning-path response-cache statistics.
 * All reads are defensive — a missing meter or cache simply reports "no
 * data" instead of failing the dashboard.
 */
@Service
public class AiMetricsService {

    private static final String CALLS = "skillforge_ai_calls_total";
    private static final String TIMER = "skillforge_ai_call_duration";
    private static final String TOKENS = "skillforge_ai_tokens_total";
    private static final String[] OUTCOMES = {"success", "failure"};

    private final MeterRegistry meterRegistry;
    private final CircuitBreaker circuitBreaker;
    private final GeminiProperties geminiProperties;

    public AiMetricsService(
            MeterRegistry meterRegistry,
            CircuitBreaker circuitBreaker,
            GeminiProperties geminiProperties
    ) {
        this.meterRegistry = meterRegistry;
        this.circuitBreaker = circuitBreaker;
        this.geminiProperties = geminiProperties;
    }

    public AiAdminMetricsDto build() {

        return new AiAdminMetricsDto(
                callsByOutcome(),
                durationByOutcome(),
                tokens("prompt"),
                tokens("completion"),
                geminiProperties.models(),
                circuitBreakerSnapshot(),
                cacheSnapshot()
        );
    }

    private Map<String, Long> callsByOutcome() {

        Map<String, Long> byOutcome = new LinkedHashMap<>();

        for (String outcome : OUTCOMES) {
            byOutcome.put(outcome, count(CALLS, outcome));
        }

        return byOutcome;
    }

    private Map<String, Double> durationByOutcome() {

        Map<String, Double> byOutcome = new LinkedHashMap<>();

        for (String outcome : OUTCOMES) {
            meanSeconds(outcome).ifPresent(seconds ->
                    byOutcome.put(outcome, seconds)
            );
        }

        return byOutcome;
    }

    private long count(String meterName, String outcome) {
        return meterRegistry.find(meterName)
                .tag("outcome", outcome)
                .counters()
                .stream()
                .mapToDouble(Counter::count)
                .mapToLong(count -> (long) count)
                .sum();
    }

    private long tokens(String direction) {
        return meterRegistry.find(TOKENS)
                .tag("direction", direction)
                .counters()
                .stream()
                .mapToDouble(Counter::count)
                .mapToLong(count -> (long) count)
                .sum();
    }

    private Optional<Double> meanSeconds(String outcome) {
        return meterRegistry.find(TIMER)
                .tag("outcome", outcome)
                .timers()
                .stream()
                .findFirst()
                .map(timer -> timer.mean(java.util.concurrent.TimeUnit.SECONDS));
    }

    private CircuitBreakerSnapshot circuitBreakerSnapshot() {
        return new CircuitBreakerSnapshot(
                circuitBreaker.getState().name(),
                circuitBreaker.getMetrics().getFailureRate(),
                circuitBreaker.getMetrics().getNumberOfBufferedCalls()
        );
    }

    private CacheSnapshot cacheSnapshot() {
        return new CacheSnapshot(
                cacheCounter("skillforge_ai_cache_hits_total"),
                cacheCounter("skillforge_ai_cache_misses_total"),
                cacheCounter("skillforge_ai_cache_clears_total")
        );
    }

    private long cacheCounter(String meterName) {
        return meterRegistry.find(meterName)
                .counters()
                .stream()
                .mapToDouble(Counter::count)
                .mapToLong(count -> (long) count)
                .sum();
    }
}