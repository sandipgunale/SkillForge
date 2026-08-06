package com.project.skillforgebackend.common.security;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.project.skillforgebackend.common.exception.RateLimitException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.caffeine.Bucket4jCaffeine;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Single-instance token-bucket rate limiter backed by Bucket4j.
 *
 * Buckets are accessed through a {@link ProxyManager}, the same abstraction
 * Bucket4j uses for shared stores (Redis, JDBC, Hazelcast, ...): scaling to
 * multiple instances only requires swapping the proxy manager for a
 * distributed one — the call sites ({@link #check(String)}) do not change.
 * Idle buckets expire after 30 minutes and the cache is capped at 10k keys.
 */
@Component
@Slf4j
public class RateLimiter {

    private final ProxyManager<String> proxyManager;

    @Value("${security.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${security.rate-limit.max-requests:5}")
    private int maxRequests;

    @Value("${security.rate-limit.window-minutes:10}")
    private long windowMinutes;

    /**
     * Optional (unit tests construct the limiter without Spring); when
     * absent, rejection metrics are simply not recorded.
     */
    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    public RateLimiter() {
        this.proxyManager = Bucket4jCaffeine.<String>builderFor(
                        Caffeine.newBuilder().maximumSize(10_000))
                .expirationAfterWrite(
                        ExpirationAfterWriteStrategy.fixedTimeToLive(
                                Duration.ofMinutes(30)
                        )
                )
                .build();
    }

    /**
     * Checks whether the caller may proceed. Throws {@link RateLimitException}
     * when the token budget for the window has been exhausted.
     */
    public void check(String key) {
        if (!enabled) {
            return;
        }

        ConsumptionProbe probe = probe(key);

        if (!probe.isConsumed()) {
            recordRejection(key);
            log.warn("Rate limit exceeded for key {} ({} requests per {}min)",
                    key, maxRequests, windowMinutes);
            throw new RateLimitException(
                    "Too many requests. Please try again later."
            );
        }
    }

    private void recordRejection(String key) {

        if (meterRegistry == null) {
            return;
        }

        int separator = key.indexOf(':');

        String endpoint = separator >= 0
                ? key.substring(separator + 1)
                : key;

        meterRegistry.counter(
                "skillforge_ratelimit_rejections",
                "endpoint",
                endpoint
        ).increment();
    }

    /** Key derived from client IP + endpoint for scoped limits. */
    public String key(String clientIp, String endpoint) {
        return clientIp == null ? "unknown:" + endpoint : clientIp + ":" + endpoint;
    }

    ConsumptionProbe probe(String key) {
        return proxyManager.builder().build(key, this::bucketConfiguration)
                .tryConsumeAndReturnRemaining(1);
    }

    private BucketConfiguration bucketConfiguration() {
        return BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(maxRequests)
                        .refillGreedy(
                                maxRequests,
                                Duration.ofMinutes(windowMinutes)
                        )
                        .build())
                .build();
    }
}
