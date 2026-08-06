package com.project.skillforgebackend.config;

import com.project.skillforgebackend.common.security.RateLimiter;
import com.project.skillforgebackend.config.properties.RateLimitProperties;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Wires the two {@link RateLimiter} instances: auth endpoints get the
 * {@code security.rate-limit.*} budget, AI endpoints get the
 * {@code security.rate-limit.ai.*} budget. Because both beans share the
 * {@link RateLimiter} type, consumers must inject by qualifier.
 */
@Configuration
public class RateLimitingConfig {

    @Bean
    public RateLimiter authRateLimiter(RateLimitProperties properties,
                                       MeterRegistry meterRegistry) {
        return new RateLimiter(properties, meterRegistry);
    }

    @Bean
    public RateLimiter aiRateLimiter(RateLimitProperties properties,
                                     MeterRegistry meterRegistry) {
        return new RateLimiter(properties.ai(), meterRegistry);
    }
}