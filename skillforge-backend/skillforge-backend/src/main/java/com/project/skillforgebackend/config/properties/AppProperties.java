package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Application-level configuration ({@code app.*}): the frontend origin used
 * in emailed reset links, the password-reset token lifetime, CORS allow-list,
 * the monitoring (Prometheus scrape) IP allow-list and the enterprise
 * security-header policy (CSP / HSTS).
 */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String frontendUrl,
        @Positive long passwordResetTtlMinutes,
        Cors cors,
        Monitoring monitoring,
        SecurityHeaders securityHeaders
) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Monitoring(List<String> allowedIps) {
    }

    /**
     * HTTP security headers applied by the security filter chain.
     * {@code contentSecurityPolicy} is the raw CSP directive list;
     * HSTS is only emitted when {@code hstsEnabled} is true (browsers
     * ignore it over plain HTTP, so it is safe for local dev).
     */
    public record SecurityHeaders(
            String contentSecurityPolicy,
            boolean hstsEnabled,
            boolean hstsIncludeSubDomains,
            @Positive long hstsMaxAgeSeconds
    ) {
    }
}
