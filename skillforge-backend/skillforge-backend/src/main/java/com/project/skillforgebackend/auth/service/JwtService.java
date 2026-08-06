package com.project.skillforgebackend.auth.service;


import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
@Slf4j
public class JwtService {

    public static final String TOKEN_TYPE_ACCESS = "ACCESS";
    public static final String TOKEN_TYPE_REFRESH = "REFRESH";
    public static final String CLAIM_TYPE = "type";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_REMEMBER_ME = "rememberMe";

    private static final String ISSUER = "skillforge";
    private static final String AUDIENCE = "skillforge-api";

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Value("${jwt.refresh-token-expiry-short}")
    private long refreshTokenExpiryShort;

    public String generateAccessToken(String email, Map<String, Object> extraClaims) {
        Map<String, Object> claims = new java.util.HashMap<>(extraClaims);
        claims.put(CLAIM_TYPE, TOKEN_TYPE_ACCESS);
        return buildToken(email, claims, accessTokenExpiry);
    }

    public String generateRefreshToken(String email, boolean rememberMe) {
        Map<String, Object> claims = Map.of(
                CLAIM_TYPE, TOKEN_TYPE_REFRESH,
                CLAIM_REMEMBER_ME, rememberMe
        );
        long expiry = rememberMe ? refreshTokenExpiry : refreshTokenExpiryShort;
        return buildToken(email, claims, expiry);
    }

    public long getRefreshTokenLifetime(boolean rememberMe) {
        return rememberMe ? refreshTokenExpiry : refreshTokenExpiryShort;
    }

    private String buildToken(String subject,
                              Map<String, Object> claims,
                              long expiry) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(ISSUER)
                .audience().add(AUDIENCE).and()
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
                .requireIssuer(ISSUER)
                .requireAudience(AUDIENCE)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }
}
