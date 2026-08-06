package com.project.skillforgebackend.ai.cache;

import com.project.skillforgebackend.config.properties.AiServiceProperties;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Cache for deterministic AI responses — the learning-path roadmap is
 * fully determined by its five profile inputs, so a repeated request with
 * identical parameters can be served without burning a paid completion.
 * Entries are evicted by {@code evictLearningPaths()} whenever a learning
 * path is deleted.
 *
 * <p>Respects {@code ai.service.cache-enabled}; bounded and short-lived
 * through the shared Caffeine {@link CacheManager} configuration. Hits,
 * misses and clears are recorded as micrometer counters for the admin
 * dashboard.
 */
@Component
public class AiResponseCache {

    public static final String LEARNING_PATH_CACHE = "aiLearningPath";

    private final CacheManager cacheManager;

    private final AiServiceProperties properties;

    private final Counter hits;

    private final Counter misses;

    private final Counter clears;

    public AiResponseCache(
            CacheManager cacheManager,
            AiServiceProperties properties,
            MeterRegistry meterRegistry
    ) {
        this.cacheManager = cacheManager;
        this.properties = properties;

        this.hits = Counter.builder("skillforge_ai_cache_hits_total")
                .description("Learning-path response cache hits")
                .register(meterRegistry);

        this.misses = Counter.builder("skillforge_ai_cache_misses_total")
                .description("Learning-path response cache misses")
                .register(meterRegistry);

        this.clears = Counter.builder("skillforge_ai_cache_clears_total")
                .description("Learning-path response cache clears")
                .register(meterRegistry);
    }

    public Optional<String> getLearningPath(String cacheKey) {

        if (!properties.cacheEnabled()) {
            return Optional.empty();
        }

        Cache cache = cacheManager.getCache(LEARNING_PATH_CACHE);

        if (cache == null) {
            return Optional.empty();
        }

        String value = cache.get(cacheKey, String.class);

        if (value != null) {
            hits.increment();
            return Optional.of(value);
        }

        misses.increment();
        return Optional.empty();
    }

    public void putLearningPath(String cacheKey, String roadmapJson) {

        if (!properties.cacheEnabled() || roadmapJson == null) {
            return;
        }

        Cache cache = cacheManager.getCache(LEARNING_PATH_CACHE);

        if (cache != null) {
            cache.put(cacheKey, roadmapJson);
        }
    }

    /**
     * Drops every cached roadmap. Called on learning-path deletion because
     * the roadmap for a parameter set is no longer authoritative.
     */
    public void evictLearningPaths() {

        Cache cache = cacheManager.getCache(LEARNING_PATH_CACHE);

        if (cache != null) {
            cache.clear();
            clears.increment();
        }
    }

    /**
     * Deterministic key for a roadmap request: parameter set only (no user
     * dimension — identical requests may be shared, and eviction is global
     * on write).
     */
    public static String learningPathKey(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {
        return String.join(
                "|",
                normalize(title),
                normalize(goal),
                normalize(skillLevel),
                String.valueOf(weeklyHours),
                String.valueOf(durationWeeks)
        );
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}