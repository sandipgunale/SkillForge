package com.project.skillforgebackend.auth.service;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String TEST_SECRET =
            "VGhpc0lzQVRlc3RTZWNyZXRLZXlUaGF0SXNBdExlYXN0MzJCeXRlc0xvbmch";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiry", 900000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiry", 604800000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiryShort", 86400000L);
    }

    @Test
    void accessToken_isRecognizedAsAccess_andNotAsRefresh() {
        String token = jwtService.generateAccessToken(
                "user@test.com", Map.of("role", "STUDENT"));

        assertThat(jwtService.isAccessToken(token)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isFalse();
        assertThat(jwtService.extractEmail(token)).isEqualTo("user@test.com");
    }

    @Test
    void refreshToken_isRecognizedAsRefresh_andNotAsAccess() {
        String token = jwtService.generateRefreshToken("user@test.com", true);

        assertThat(jwtService.isRefreshToken(token)).isTrue();
        assertThat(jwtService.isAccessToken(token)).isFalse();
    }

    @Test
    void refreshToken_carriesRememberMeClaim() {
        String token = jwtService.generateRefreshToken("user@test.com", true);
        assertThat(Boolean.parseBoolean(
                jwtService.extractClaim(token, JwtService.CLAIM_REMEMBER_ME))).isTrue();

        String noRemember = jwtService.generateRefreshToken("user@test.com", false);
        assertThat(Boolean.parseBoolean(
                jwtService.extractClaim(noRemember, JwtService.CLAIM_REMEMBER_ME))).isFalse();
    }

    @Test
    void refreshTokenLifetime_shortensWithoutRememberMe() {
        assertThat(jwtService.getRefreshTokenLifetime(true)).isEqualTo(604800000L);
        assertThat(jwtService.getRefreshTokenLifetime(false)).isEqualTo(86400000L);
    }

    @Test
    void accessToken_cannotPassAsRefresh() {
        String accessToken = jwtService.generateAccessToken(
                "user@test.com", Map.of("role", "STUDENT"));

        // A refresh endpoint must reject access tokens
        assertThat(jwtService.isRefreshToken(accessToken)).isFalse();
    }

    @Test
    void isTokenValid_rejectsWrongSubject() {
        String token = jwtService.generateRefreshToken("user@test.com", false);

        assertThat(jwtService.isTokenValid(token, "other@test.com")).isFalse();
        assertThat(jwtService.isTokenValid(token, "user@test.com")).isTrue();
    }

    @Test
    void isTokenValid_rejectsGarbage() {
        assertThat(jwtService.isAccessToken("not-a-jwt")).isFalse();
        assertThat(jwtService.isRefreshToken("not-a-jwt")).isFalse();
        assertThat(jwtService.isTokenValid("not-a-jwt", "user@test.com")).isFalse();
    }

    @Test
    void extractClaim_throwsOnMalformedToken() {
        assertThatThrownBy(() -> jwtService.extractClaim("garbage", JwtService.CLAIM_TYPE))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void subjectIsEmail_notSomethingElse() {
        String token = jwtService.generateAccessToken(
                "real@test.com", Map.of("role", "STUDENT", "subject", UUID.randomUUID()));

        assertThat(jwtService.extractEmail(token)).isEqualTo("real@test.com");
    }
}
