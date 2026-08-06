package com.project.skillforgebackend.auth.controller;


import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.dto.*;
import com.project.skillforgebackend.auth.service.AuthService;
import com.project.skillforgebackend.auth.service.JwtService;
import com.project.skillforgebackend.auth.service.PasswordResetService;
import com.project.skillforgebackend.auth.service.RefreshTokenService;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.common.security.RateLimiter;
import com.project.skillforgebackend.config.properties.CookieProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final RateLimiter rateLimiter;
    private final PasswordResetService passwordResetService;
    private final RefreshTokenService refreshTokenService;
    private final ApplicationEventPublisher eventPublisher;
    private final CookieProperties cookieProperties;

    public AuthController(AuthService authService,
                          JwtService jwtService,
                          @Qualifier("authRateLimiter") RateLimiter rateLimiter,
                          PasswordResetService passwordResetService,
                          RefreshTokenService refreshTokenService,
                          ApplicationEventPublisher eventPublisher,
                          CookieProperties cookieProperties) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.rateLimiter = rateLimiter;
        this.passwordResetService = passwordResetService;
        this.refreshTokenService = refreshTokenService;
        this.eventPublisher = eventPublisher;
        this.cookieProperties = cookieProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        rateLimiter.check(rateLimiter.key(clientIp(servletRequest), "register"));

        AuthResponse authResponse = authService.register(request);

        setRefreshTokenCookie(response, authResponse);

// Remove refresh token before sending JSON response
        authResponse.setRefreshToken(null);

        return ResponseEntity.status(201).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) {

        rateLimiter.check(rateLimiter.key(clientIp(servletRequest), "login"));

        AuthResponse authResponse = authService.login(request);

        setRefreshTokenCookie(response, authResponse);

        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request,
                                                HttpServletResponse response) {
        rateLimiter.check(rateLimiter.key(clientIp(request), "refresh"));

        String refreshToken = extractRefreshTokenFromCookie(request);
        AuthResponse authResponse = authService.refresh(refreshToken);

        setRefreshTokenCookie(response, authResponse);

        authResponse.setRefreshToken(null);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       HttpServletResponse response) {
        Cookie cookie = extractCookie(request);
        String refreshToken = cookie != null ? cookie.getValue() : null;

        refreshTokenService.revoke(refreshToken);

        ResponseCookie cleared = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieProperties.secure())
                .sameSite(cookieProperties.sameSite().name())
                .path("/api/auth")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cleared.toString());

        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.LOGOUT_SUCCESS,
                null,
                null,
                "logout (refresh token revocation attempted)"
        ));

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {

        rateLimiter.check(rateLimiter.key(clientIp(servletRequest), "forgot-password"));

        passwordResetService.requestReset(request);

        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, a reset link is on its way."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {

        rateLimiter.check(rateLimiter.key(clientIp(servletRequest), "reset-password"));

        passwordResetService.resetPassword(request);

        return ResponseEntity.ok(Map.of(
                "message", "Password updated. You can now sign in with your new password."
        ));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void setRefreshTokenCookie(HttpServletResponse response,
                                       AuthResponse authResponse) {

        long lifetimeSeconds = authResponse.isRememberMe()
                ? jwtService.getRefreshTokenLifetime(true) / 1000
                : jwtService.getRefreshTokenLifetime(false) / 1000;

        ResponseCookie cookie = ResponseCookie.from(
                "refreshToken",
                authResponse.getRefreshToken()
        )
                .httpOnly(true)
                .secure(cookieProperties.secure())
                .sameSite(cookieProperties.sameSite().name())
                .path("/api/auth")
                .maxAge(lifetimeSeconds)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie cookie = extractCookie(request);
        return Arrays
                .stream(cookie == null ? new Cookie[0] : new Cookie[]{cookie})
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst()
                .orElseThrow(
                        InvalidCredentialsException::new
                );
    }

    private Cookie extractCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .findFirst()
                .orElse(null);
    }

    private String clientIp(HttpServletRequest request) {
        // With server.forward-headers-strategy=framework the remote address is
        // already the original client IP when running behind a proxy that sets
        // X-Forwarded-For (the proxy overwrites the header on arrival).
        return request.getRemoteAddr();
    }
}