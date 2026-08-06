package com.project.skillforgebackend.ai.cache;

import com.project.skillforgebackend.config.properties.AiServiceProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiResponseCacheTest {

    private SimpleCacheManager cacheManager;

    private AiResponseCache cache;

    private static final AiServiceProperties ENABLED =
            new AiServiceProperties(true, true, 200, 100000, 100);

    private static final AiServiceProperties DISABLED =
            new AiServiceProperties(false, true, 200, 100000, 100);

    @BeforeEach
    void setUp() {
        cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(List.of(
                new ConcurrentMapCache(AiResponseCache.LEARNING_PATH_CACHE)
        ));
        cacheManager.afterPropertiesSet();
        cache = new AiResponseCache(
                cacheManager,
                ENABLED,
                new SimpleMeterRegistry()
        );
    }

    @Test
    void storesAndRetrievesRoadmap() {
        String key = AiResponseCache.learningPathKey("Java", "Become employable", "BEGINNER", 10, 12);
        String roadmap = "{\"title\":\"Java\"}";

        assertTrue(cache.getLearningPath(key).isEmpty());

        cache.putLearningPath(key, roadmap);

        Optional<String> hit = cache.getLearningPath(key);

        assertTrue(hit.isPresent());
        assertEquals(roadmap, hit.get());
    }

    @Test
    void disabledCacheNeverHits() {
        AiResponseCache disabled = new AiResponseCache(
                cacheManager,
                DISABLED,
                new SimpleMeterRegistry()
        );

        disabled.putLearningPath("k", "{}");

        assertTrue(disabled.getLearningPath("k").isEmpty());
    }

    @Test
    void evictClearsAllEntries() {
        String key = AiResponseCache.learningPathKey("Spring", "Learn", "INTERMEDIATE", 5, 8);
        cache.putLearningPath(key, "{}");

        cache.evictLearningPaths();

        assertTrue(cache.getLearningPath(key).isEmpty());
    }

    @Test
    void normalizesKeyComponents() {
        String a = AiResponseCache.learningPathKey("  Java  ", "Goal", "BEGINNER", 10, 12);
        String b = AiResponseCache.learningPathKey("java", "GOAL", "beginner", 10, 12);

        assertEquals(a, b);
    }

    @Test
    void missingCacheManagerCacheBehavesAsEmpty() {
        SimpleCacheManager empty = new SimpleCacheManager();
        AiResponseCache orphan = new AiResponseCache(
                empty,
                ENABLED,
                new SimpleMeterRegistry()
        );

        assertTrue(orphan.getLearningPath("k").isEmpty());
        orphan.putLearningPath("k", "{}");
        orphan.evictLearningPaths();
    }
}
