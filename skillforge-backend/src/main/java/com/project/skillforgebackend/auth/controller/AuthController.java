package com.project.skillforgebackend.auth.controller;


import com.project.skillforgebackend.auth.dto.*;
import com.project.skillforgebackend.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.register(request);
        setRefreshTokenCookie(response, authResponse);
        return ResponseEntity.status(201).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);
        setRefreshTokenCookie(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request,
                                                HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        AuthResponse authResponse = authService.refresh(refreshToken);
        setRefreshTokenCookie(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/api/auth");
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void setRefreshTokenCookie(HttpServletResponse response,
                                       AuthResponse authResponse) {
        // Note: in production set cookie.setSecure(true) for HTTPS
        Cookie cookie = new Cookie("refreshToken",
                generateRefreshTokenForCookie(authResponse));
        cookie.setHttpOnly(true);
        cookie.setPath("/api/auth");
        cookie.setMaxAge((int)(refreshTokenExpiry / 1000));
        response.addCookie(cookie);
    }

    private String generateRefreshTokenForCookie(AuthResponse authResponse) {
        // Refresh token is generated inside AuthService; here we pass it through
        // via a thin wrapper — in production extract it from authResponse
        return authResponse.getAccessToken(); // swap for refreshToken field
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            throw new com.project.skillforgebackend.exception.InvalidCredentialsException();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(
                        com.project.skillforgebackend.exception.InvalidCredentialsException::new
                );
    }
}