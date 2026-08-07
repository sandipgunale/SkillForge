package com.project.skillforgebackend.ai.metrics;

import com.project.skillforgebackend.ai.cache.AiResponseCache;
import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.AiModelMetricDto;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Timer;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Aggregates the AI subsystem's runtime observations (call counts, token
 * usage, latencies, circuit-breaker health, cache efficiency) into a single
 * report for the admin AI dashboard. Read-only; no provider is called.
 */
@Component
public class AiMetricsService {

    private static final String CALLS = "skillforge_ai_calls_total";
    private static final String DURATION = "skillforge_ai_call_duration";
    private static final String TOKENS = "skillforge_ai_tokens_total";

    private final MeterRegistry meterRegistry;
    private final CircuitBreaker circuitBreaker;
    private final CacheManager cacheManager;

    public AiMetricsService(
            MeterRegistry meterRegistry,
            CircuitBreaker circuitBreaker,
            CacheManager cacheManager) {
        this.meterRegistry = meterRegistry;
        this.circuitBreaker = circuitBreaker;
        this.cacheManager = cacheManager;
    }

    public AiAdminMetricsDto metrics() {

        Map<String, Row> rows = new LinkedHashMap<>();

        addCallCounters(rows);
        addTimers(rows);
        addTokenCounters(rows);

        List<AiModelMetricDto> models = rows.values().stream()
                .map(Row::toDto)
                .toList();

        long successfulCalls = rows.values().stream()
                .mapToLong(Row::successfulCalls)
                .sum();

        long failedCalls = rows.values().stream()
                .mapToLong(Row::failedCalls)
                .sum();

        return new AiAdminMetricsDto(
                circuitBreaker.getState().name(),
                circuitBreaker.getMetrics().getFailureRate(),
                successfulCalls + failedCalls,
                successfulCalls,
                failedCalls,
                models,
                cacheRequestCount(),
                cacheHitCount(),
                cacheMissCount()
        );
    }

    private void addCallCounters(Map<String, Row> rows) {

        for (Counter counter : counters(CALLS)) {

            Map<String, String> tags = tagsOf(counter.getId());

            Row row = rows.computeIfAbsent(
                    rowKey(tags.get("provider"), tags.get("model")),
                    key -> new Row(tags.get("provider"), tags.get("model"))
            );

            long count = (long) counter.count();

            if ("success".equals(tags.get("outcome"))) {
                row.successfulCalls += count;
            } else {
                row.failedCalls += count;
            }
        }
    }

    private void addTimers(Map<String, Row> rows) {

        for (Timer timer : timers(DURATION)) {

            Map<String, String> tags = tagsOf(timer.getId());

            if (!"success".equals(tags.get("outcome"))) {
                continue;
            }

            Row row = rows.get(rowKey(tags.get("provider"), tags.get("model")));

            if (row != null) {
                row.averageDurationMs = timer.mean(TimeUnit.MILLISECONDS);
            }
        }
    }

    private void addTokenCounters(Map<String, Row> rows) {

        for (Counter counter : counters(TOKENS)) {

            Map<String, String> tags = tagsOf(counter.getId());

            Row row = rows.computeIfAbsent(
                    rowKey(tags.get("provider"), tags.get("model")),
                    key -> new Row(tags.get("provider"), tags.get("model"))
            );

            long tokens = (long) counter.count();

            if ("prompt".equals(tags.get("direction"))) {
                row.promptTokens = tokens;
            } else {
                row.completionTokens = tokens;
            }
        }
    }

    private long cacheRequestCount() {
        com.github.benmanes.caffeine.cache.stats.CacheStats stats = cacheStats();
        return stats == null ? 0 : stats.requestCount();
    }

    private long cacheHitCount() {
        com.github.benmanes.caffeine.cache.stats.CacheStats stats = cacheStats();
        return stats == null ? 0 : stats.hitCount();
    }

    private long cacheMissCount() {
        com.github.benmanes.caffeine.cache.stats.CacheStats stats = cacheStats();
        return stats == null ? 0 : stats.missCount();
    }

    private com.github.benmanes.caffeine.cache.stats.CacheStats cacheStats() {

        Cache cache = cacheManager.getCache(AiResponseCache.CACHE_NAME);

        if (cache instanceof CaffeineCache caffeineCache) {
            return caffeineCache.getNativeCache().stats();
        }

        return null;
    }

    private List<Counter> counters(String name) {
        return meterRegistry.getMeters().stream()
                .filter(meter -> name.equals(meter.getId().getName()))
                .filter(Counter.class::isInstance)
                .map(Counter.class::cast)
                .toList();
    }

    private List<Timer> timers(String name) {
        return meterRegistry.getMeters().stream()
                .filter(meter -> name.equals(meter.getId().getName()))
                .filter(Timer.class::isInstance)
                .map(Timer.class::cast)
                .toList();
    }

    private static Map<String, String> tagsOf(Meter.Id id) {

        Map<String, String> tags = new LinkedHashMap<>();

        for (Tag tag : id.getTags()) {
            tags.put(tag.getKey(), tag.getValue());
        }

        return tags;
    }

    private static String rowKey(String provider, String model) {
        return provider + "::" + (model == null ? "unknown" : model);
    }

    private static final class Row {

        private final String provider;
        private final String model;
        private long successfulCalls;
        private long failedCalls;
        private double averageDurationMs;
        private long promptTokens;
        private long completionTokens;

        private Row(String provider, String model) {
            this.provider = provider;
            this.model = model == null ? "unknown" : model;
        }

        private long successfulCalls() {
            return successfulCalls;
        }

        private long failedCalls() {
            return failedCalls;
        }

        private AiModelMetricDto toDto() {
            return new AiModelMetricDto(
                    provider,
                    model,
                    successfulCalls,
                    failedCalls,
                    averageDurationMs,
                    promptTokens,
                    completionTokens
            );
        }
    }
}