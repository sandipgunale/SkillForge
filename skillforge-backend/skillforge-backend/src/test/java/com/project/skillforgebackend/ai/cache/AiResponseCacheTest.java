package com.project.skillforgebackend.ai.cache;

import com.project.skillforgebackend.config.properties.AiServiceProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.caffeine.CaffeineCacheManager;

import static org.assertj.core.api.Assertions.assertThat;

class AiResponseCacheTest {

    private AiResponseCache cache;

    @BeforeEach
    void setUp() {
        cache = new AiResponseCache(
                new CaffeineCacheManager(),
                new AiServiceProperties(true, 300, 50000, 50, 20000)
        );
    }

    @Test
    void storesAndRetrievesByExactKey() {
        String key = cache.key("Java", "Become an engineer", "BEGINNER", 5, 12);

        assertThat(cache.getLearningPath(key)).isEmpty();

        cache.putLearningPath(key, "{\"roadmap\": []}");

        assertThat(cache.getLearningPath(key))
                .hasValue("{\"roadmap\": []}");
    }

    @Test
    void keysAreNormalisedAndDeterministic() {
        String upper = cache.key("  Java ", "Learn Java", "BEGINNER", 5, 12);
        String lower = cache.key("java", "learn java", "beginner", 5, 12);

        assertThat(upper).isEqualTo(lower);
    }

    @Test
    void distinctParametersNeverCollide() {
        String a = cache.key("Java", "Goal A", "BEGINNER", 5, 12);
        String b = cache.key("Java", "Goal B", "BEGINNER", 5, 12);

        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void evictAllClearsEntries() {
        String key = cache.key("Java", "Goal", "BEGINNER", 5, 12);
        cache.putLearningPath(key, "{\"roadmap\": []}");

        cache.evictAll();

        assertThat(cache.getLearningPath(key)).isEmpty();
    }

    @Test
    void disabledCacheNeverStores() {
        AiResponseCache disabled = new AiResponseCache(
                new CaffeineCacheManager(),
                new AiServiceProperties(false, 300, 50000, 50, 20000)
        );

        String key = disabled.key("Java", "Goal", "BEGINNER", 5, 12);
        disabled.putLearningPath(key, "{\"roadmap\": []}");

        assertThat(disabled.getLearningPath(key)).isEmpty();
    }
}