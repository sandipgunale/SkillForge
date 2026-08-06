package com.project.skillforgebackend.common.security;

import com.project.skillforgebackend.common.exception.RateLimitException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory fixed-window rate limiter.
 * Keyed by client IP per endpoint; counts reset when the window expires.
 * Sufficient for a single-instance deployment; swap for Redis/Bucket4j
 * when running horizontally.
 */
@Component
@Slf4j
public class RateLimiter {

    private static final class Window {
        long windowStart;
        int count;

        Window(long windowStart) {
            this.windowStart = windowStart;
            this.count = 0;
        }
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Value("${security.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${security.rate-limit.max-requests:5}")
    private int maxRequests;

    @Value("${security.rate-limit.window-minutes:10}")
    private long windowMinutes;

    /**
     * Checks whether the caller may proceed. Throws {@link RateLimitException}
     * when the limit for the window has been exceeded.
     */
    public void check(String key) {
        if (!enabled) {
            return;
        }

        long now = System.currentTimeMillis();
        long windowMs = Duration.ofMinutes(windowMinutes).toMillis();

        Window window = windows.compute(key, (k, current) -> {
            if (current == null || now - current.windowStart >= windowMs) {
                return new Window(now);
            }
            return current;
        });

        synchronized (window) {
            window.count++;

            if (window.count > maxRequests) {
                log.warn("Rate limit exceeded for key {} ({} requests in {}min)",
                        key, window.count, windowMinutes);
                throw new RateLimitException(
                        "Too many requests. Please try again later."
                );
            }
        }
    }

    /** Key derived from client IP + endpoint for scoped limits. */
    public String key(String clientIp, String endpoint) {
        return clientIp == null ? "unknown:" + endpoint : clientIp + ":" + endpoint;
    }
}
