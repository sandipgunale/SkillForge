package com.project.skillforgebackend.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * JWT signing and lifetime configuration ({@code jwt.*}).
 *
 * <p>The secret has no default on purpose: {@link #secret()} must come from
 * the {@code JWT_SECRET} environment variable and is validated both here
 * (not blank) and by {@link com.project.skillforgebackend.config.ConfigValidationService}
 * (&gt;= 256 bits after Base64 decoding) before any bean is created.
 *
 * <p>Issuer, audience and clock skew are enforced during parsing in
 * {@link com.project.skillforgebackend.auth.service.JwtService}; skew is
 * the tolerance applied when a token's {@code exp} sits close to the
 * verifier's clock.
 */
@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        @NotBlank(message = "jwt.secret (JWT_SECRET) must be set") String secret,
        @Positive long accessTokenExpiry,
        @Positive long refreshTokenExpiry,
        @Positive long refreshTokenExpiryShort,
        @NotBlank(message = "jwt.issuer (JWT_ISSUER) must be set") String issuer,
        @NotBlank(message = "jwt.audience (JWT_AUDIENCE) must be set") String audience,
        @PositiveOrZero long clockSkewSeconds
) {
}
