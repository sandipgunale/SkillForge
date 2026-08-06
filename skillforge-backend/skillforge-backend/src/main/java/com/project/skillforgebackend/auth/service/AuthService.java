package com.project.skillforgebackend.auth.service;



import com.project.skillforgebackend.auth.dto.*;
import com.project.skillforgebackend.common.exception.EmailAlreadyExistsException;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException();
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(User.Role.STUDENT)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getEmail());

        return buildAuthResponse(saved, false);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, request.isRememberMe());
    }

    public AuthResponse refresh(String refreshToken) {
        // Only REFRESH tokens may be used at the refresh endpoint
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new InvalidCredentialsException();
        }

        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!jwtService.isTokenValid(refreshToken, email)) {
            throw new InvalidCredentialsException();
        }

        boolean rememberMe = Boolean.parseBoolean(
                jwtService.extractClaim(refreshToken, JwtService.CLAIM_REMEMBER_ME)
        );

        return buildAuthResponse(user, rememberMe);
    }

    private AuthResponse buildAuthResponse(User user, boolean rememberMe) {
        Map<String, Object> claims = Map.of("role", user.getRole().name());
        String accessToken  = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), rememberMe);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .rememberMe(rememberMe)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .build())
                .build();
    }
}