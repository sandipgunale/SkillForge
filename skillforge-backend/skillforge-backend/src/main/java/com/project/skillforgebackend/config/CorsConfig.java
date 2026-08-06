package com.project.skillforgebackend.config;

import com.project.skillforgebackend.config.properties.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.net.URI;
import java.util.List;

@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    private final AppProperties appProperties;

    public CorsConfig(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    /**
     * Comma-separated list of allowed origins, bound from
     * {@code app.cors.allowed-origins}. The dev profile defaults to the
     * {@code FRONTEND_URL} env var (localhost); the base configuration has
     * NO fallback, so a deployed environment must set
     * {@code APP_CORS_ALLOWED_ORIGINS} (or {@code FRONTEND_URL}) explicitly.
     *
     * Wildcard origins are rejected on purpose: credentials (the refresh
     * cookie + Authorization header) are allowed, and the CORS spec forbids
     * wildcard origins together with credentials. Fail-fast here is
     * intentional — an open CORS policy is worse than a failed boot.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> rawOrigins = appProperties.cors() == null
                ? List.of()
                : appProperties.cors().allowedOrigins();
        List<String> origins = parseOrigins(rawOrigins);

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins is not configured. " +
                    "Set APP_CORS_ALLOWED_ORIGINS (comma-separated list of origins, e.g. " +
                    "https://app.skillforge.dev) or FRONTEND_URL in the environment. " +
                    "The application refuses to boot with an open CORS policy."
            );
        }

        log.info("CORS allowed origins: {}", origins);

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        configuration.setExposedHeaders(List.of(
                "Authorization",
                "X-Request-Id"
        ));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    private List<String> parseOrigins(List<String> raw) {
        if (raw == null) {
            return List.of();
        }
        return raw.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .peek(this::validateOrigin)
                .toList();
    }

    /**
     * Each entry must be a concrete http(s) origin — no wildcards, no paths.
     */
    private void validateOrigin(String origin) {
        if (origin.contains("*")) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins must not contain wildcard patterns (got: '" + origin +
                    "'). Credentials are allowed, so concrete origins are required."
            );
        }
        try {
            URI uri = URI.create(origin);
            boolean valid = ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))
                    && uri.getHost() != null
                    && uri.getPath().isEmpty()
                    && uri.getRawQuery() == null;
            if (!valid) {
                throw new IllegalArgumentException("not an http(s) origin");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins contains an invalid origin: '" + origin +
                    "'. Expected a bare http(s) origin such as https://app.skillforge.dev"
            );
        }
    }
}
