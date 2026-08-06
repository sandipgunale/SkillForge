package com.project.skillforgebackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Fails application startup with one readable, complete error message when
 * required environment configuration is missing or malformed — instead of a
 * placeholder-resolution failure, an NPE three layers deep, or a weak JWT
 * secret that only explodes on the first login.
 *
 * <p>Implemented as a {@link BeanFactoryPostProcessor} so validation runs
 * before ANY bean is instantiated (before Flyway, the DataSource pool, the
 * JWT signing key, mail, ...) and therefore always reports the full picture.
 *
 * <p>All secrets are sourced exclusively from environment variables
 * ({@code JWT_SECRET}, {@code DB_*}, {@code *_API_KEY}, {@code SMTP_*});
 * nothing here (or anywhere in the configuration) falls back to a committed
 * default for a credential.
 */
@Component
public class ConfigValidationService implements BeanFactoryPostProcessor, EnvironmentAware {

    /** HS256 requires a 256-bit key — 32 bytes after Base64 decoding. */
    public static final int MIN_JWT_SECRET_BYTES = 32;

    private static final Logger log = LoggerFactory.getLogger(ConfigValidationService.class);

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        validate(this.environment);
    }

    void validate(Environment env) {
        List<String> errors = new ArrayList<>();

        require(env, "DB_URL", errors);
        require(env, "DB_USERNAME", errors);
        require(env, "DB_PASSWORD", errors);
        require(env, "JWT_SECRET", errors);

        String jwtSecret = env.getProperty("JWT_SECRET", "");
        if (jwtSecret != null && !jwtSecret.isBlank()) {
            validateJwtSecret(jwtSecret, errors);
        }

        if (isProd(env) && noAiProviderConfigured(env)) {
            errors.add(
                "At least one AI provider key is required in the prod profile: "
                    + "set GEMINI_API_KEY or OPENAI_API_KEY"
            );
        }

        if (!errors.isEmpty()) {
            String message = String.join("\n  - ", errors);
            throw new IllegalStateException(
                "SkillForge backend is not configured. Missing or invalid required environment variables:\n"
                    + "  - " + message
                    + "\nCopy .env.example to .env (or export the variables) and retry."
            );
        }

        log.info("Configuration validation passed: all required environment variables are present");
    }

    private void require(Environment env, String var, List<String> errors) {
        String value = env.getProperty(var, "");
        if (value == null || value.isBlank()) {
            errors.add(var + " is not set");
        }
    }

    private void validateJwtSecret(String secret, List<String> errors) {
        try {
            byte[] key = java.util.Base64.getDecoder().decode(secret.trim());
            if (key.length < MIN_JWT_SECRET_BYTES) {
                errors.add(
                    "JWT_SECRET decodes to " + key.length + " bytes; HS256 requires at least "
                        + MIN_JWT_SECRET_BYTES + " bytes (256 bits). Generate one with: openssl rand -base64 64"
                );
            }
        } catch (IllegalArgumentException e) {
            errors.add("JWT_SECRET is not valid Base64. Generate one with: openssl rand -base64 64");
        }
    }

    private boolean isProd(Environment env) {
        return Arrays.asList(env.getActiveProfiles()).contains("prod");
    }

    private boolean noAiProviderConfigured(Environment env) {
        return isBlank(env.getProperty("GEMINI_API_KEY", ""))
            && isBlank(env.getProperty("OPENAI_API_KEY", ""));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
