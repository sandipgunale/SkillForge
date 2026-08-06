package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Refresh-token cookie attributes ({@code cookie.*}). The cookie is
 * HttpOnly and scoped to {@code /api/auth}; {@code secure} must be true
 * behind HTTPS (COOKIE_SECURE=true).
 */
@Validated
@ConfigurationProperties(prefix = "cookie")
public record CookieProperties(
        @NotNull SameSite sameSite,
        boolean secure
) {

    public enum SameSite {
        LAX, STRICT, NONE
    }
}
