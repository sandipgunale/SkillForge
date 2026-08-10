package com.project.skillforgebackend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Bootstrap admin account ({@code app.admin.*}). The account is seeded at
 * startup when {@code password} is set; the password comes exclusively from
 * the environment ({@code ADMIN_PASSWORD}) and is never committed with a
 * default. The email defaults to {@code admin@skillforge.com} but can be
 * overridden with {@code ADMIN_EMAIL}.
 */
@Validated
@ConfigurationProperties(prefix = "app.admin")
public record AdminBootstrapProperties(
        String email,
        String password
) {
}
