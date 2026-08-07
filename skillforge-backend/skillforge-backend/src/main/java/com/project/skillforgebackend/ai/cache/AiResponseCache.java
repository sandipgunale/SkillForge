package com.project.skillforgebackend.ai.cache;

import com.project.skillforgebackend.config.properties.AiServiceProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;

/**
 * Deterministic-completion cache keyed on the exact request parameters.
 * Learning-path generation with identical inputs is cached so repeated
 * "generate roadmap" calls for the same profile do not burn provider quota;
 * the cache is bounded and short-lived via the shared Caffeine spec.
 */
@Component
public class AiResponseCache {

    public static final String CACHE_NAME = "aiLearningPath";

    private final CacheManager cacheManager;

    private final AiServiceProperties properties;

    public AiResponseCache(CacheManager cacheManager, AiServiceProperties properties) {
        this.cacheManager = cacheManager;
        this.properties = properties;
    }

    /**
     * Builds a deterministic, collision-resistant key for a roadmap request.
     */
    public String key(String title, String goal, String skillLevel,
                      Integer weeklyHours, Integer durationWeeks) {
        return new StringBuilder()
                .append(normalize(title)).append('|')
                .append(normalize(goal)).append('|')
                .append(normalize(skillLevel)).append('|')
                .append(weeklyHours).append('|')
                .append(durationWeeks)
                .toString();
    }

    public Optional<String> getLearningPath(String key) {

        if (!properties.cacheEnabled()) {
            return Optional.empty();
        }

        Cache cache = cache();

        if (cache == null) {
            return Optional.empty();
        }

        String value = cache.get(key, String.class);

        return Optional.ofNullable(value);
    }

    public void putLearningPath(String key, String roadmapJson) {

        if (!properties.cacheEnabled()) {
            return;
        }

        Cache cache = cache();

        if (cache != null) {
            cache.put(key, roadmapJson);
        }
    }

    /**
     * Clears every cached roadmap. Called on learning-path writes so user
     * edits that could affect a roadmap never serve a stale completion.
     */
    public void evictAll() {

        Cache cache = cache();

        if (cache != null) {
            cache.clear();
        }
    }

    private Cache cache() {
        return cacheManager.getCache(CACHE_NAME);
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}