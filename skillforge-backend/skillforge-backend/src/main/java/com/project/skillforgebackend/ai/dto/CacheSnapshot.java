package com.project.skillforgebackend.ai.dto;

/**
 * Statistics of the learning-path response cache.
 *
 * @param hits   cache hits
 * @param misses cache misses
 * @param clears explicit cache clears (e.g. on learning-path deletion)
 */
public record CacheSnapshot(
        long hits,
        long misses,
        long clears
) {
}