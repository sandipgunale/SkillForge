package com.project.skillforgebackend.auth.service;


import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.project.skillforgebackend.config.properties.JwtProperties;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    public static final String TOKEN_TYPE_ACCESS = "ACCESS";
    public static final String TOKEN_TYPE_REFRESH = "REFRESH";
    public static final String CLAIM_TYPE = "type";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_REMEMBER_ME = "rememberMe";

    /** HS256 requires a 256-bit key — 32 bytes after Base64 decoding. */
    private static final int MIN_SECRET_BYTES = 32;

    private final JwtProperties jwtProperties;

    /**
     * Fail fast with a precise message if the signing key is missing or too
     * weak, instead of a WeakKeyException surfacing on the first login.
     * (ConfigValidationService performs the same check at boot; this is
     * defense-in-depth for direct programmatic use of this service.)
     */
    @PostConstruct
    void validateSecretKey() {
        String secretKey = jwtProperties.secret();
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "jwt.secret (JWT_SECRET env var) is not configured. Generate one with: openssl rand -base64 64");
        }
        try {
            byte[] key = Decoders.BASE64.decode(secretKey.trim());
            if (key.length < MIN_SECRET_BYTES) {
                throw new IllegalStateException(
                        "jwt.secret (JWT_SECRET env var) decodes to " + key.length
                                + " bytes; HS256 requires at least " + MIN_SECRET_BYTES
                                + " bytes (256 bits). Generate one with: openssl rand -base64 64");
            }
        } catch (DecodingException e) {
            throw new IllegalStateException(
                    "jwt.secret (JWT_SECRET env var) is not valid Base64. Generate one with: openssl rand -base64 64",
                    e);
        }
    }

    public String generateAccessToken(String email, Map<String, Object> extraClaims) {
        Map<String, Object> claims = new java.util.HashMap<>(extraClaims);
        claims.put(CLAIM_TYPE, TOKEN_TYPE_ACCESS);
        return buildToken(email, claims, jwtProperties.accessTokenExpiry());
    }    public String generateRefreshToken(String email, boolean rememberMe) {
        Map<String, Object> claims = Map.of(
                CLAIM_TYPE, TOKEN_TYPE_REFRESH,
                CLAIM_REMEMBER_ME, rememberMe
        );
        long expiry = rememberMe
                ? jwtProperties.refreshTokenExpiry()
                : jwtProperties.refreshTokenExpiryShort();
        return buildToken(email, claims, expiry);
    }

    public long getRefreshTokenLifetime(boolean rememberMe) {
        return rememberMe
                ? jwtProperties.refreshTokenExpiry()
                : jwtProperties.refreshTokenExpiryShort();
    }

    private String buildToken(String subject,
                              Map<String, Object> claims,
                              long expiry) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(jwtProperties.issuer())
                .audience().add(jwtProperties.audience()).and()
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractClaim(String token, String claimName) {
        Object value = extractAllClaims(token).get(claimName);
        return value == null ? null : String.valueOf(value);
    }

    public boolean isAccessToken(String token) {
        try {
            return TOKEN_TYPE_ACCESS.equals(extractAllClaims(token).get(CLAIM_TYPE, String.class));
        } catch (JwtException e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return TOKEN_TYPE_REFRESH.equals(extractAllClaims(token).get(CLAIM_TYPE, String.class));
        } catch (JwtException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, String email) {
        try {
            return extractEmail(token).equals(email) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(jwtProperties.issuer())
                .requireAudience(jwtProperties.audience())
                .clockSkewSeconds(jwtProperties.clockSkewSeconds())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secret().trim()));
    }
}
