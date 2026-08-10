package com.project.skillforgebackend.auth.service;



import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.dto.*;
import com.project.skillforgebackend.common.exception.EmailAlreadyExistsException;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.mapper.UserMapper;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final RefreshTokenService refreshTokenService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        User.Role role = resolveRegistrationRole(request.getRole());

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(role)
                .isActive(true)
                .build();

        User saved;
        try {
            saved = userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            // Race-safe duplicate guard: the unique email constraint is the
            // source of truth; the existsBy check above is only a fast path.
            throw new EmailAlreadyExistsException();
        }

        String refreshToken = issueRefreshToken(saved, false);

        log.info("New user registered: {}", saved.getEmail());
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REGISTER_SUCCESS,
                saved.getId(),
                saved.getEmail(),
                null
        ));

        return buildAuthResponse(saved, false, refreshToken);
    }

    /**
     * Maps the optional role string from the register payload onto a
     * self-service role. Blank/unknown falls back to STUDENT; ADMIN can
     * never be granted through public registration (privilege escalation
     * guard — it is assignable only by an existing admin).
     */
    private User.Role resolveRegistrationRole(String requested) {
        if (requested == null || requested.isBlank()) {
            return User.Role.STUDENT;
        }
        String normalized = requested.trim().toUpperCase();
        if (!"STUDENT".equals(normalized) && !"INSTRUCTOR".equals(normalized)) {
            throw new IllegalArgumentException(
                    "Invalid role. Must be one of STUDENT, INSTRUCTOR"
            );
        }
        return User.Role.valueOf(normalized);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null || !user.isActive()
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // One generic outcome for unknown email / inactive account / bad
            // password, and one audit trail for every failure.
            eventPublisher.publishEvent(new AuthAuditEvent(
                    AuthAuditEvent.Type.LOGIN_FAILURE,
                    user != null ? user.getId() : null,
                    email,
                    user == null ? "unknown email"
                            : (!user.isActive() ? "inactive account" : "invalid password")
            ));
            throw new InvalidCredentialsException();
        }

        String refreshToken = issueRefreshToken(user, request.isRememberMe());

        log.info("User logged in: {}", user.getEmail());
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.LOGIN_SUCCESS,
                user.getId(),
                user.getEmail(),
                null
        ));

        return buildAuthResponse(user, request.isRememberMe(), refreshToken);
    }

    /**
     * Refreshes the session: validates the presented REFRESH token, rotates
     * it (revokes the old, registers a successor) and issues a fresh access
     * token. The transaction must not roll back on
     * {@link InvalidCredentialsException}: reuse detection revokes the whole
     * token family as a security response, and that revocation must commit
     * even though the request returns 401.
     */
    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public AuthResponse refresh(String refreshToken) {
        // Only REFRESH tokens may be used at the refresh endpoint
        if (!jwtService.isRefreshToken(refreshToken)) {
            publishRefreshFailure(null, "wrong token type");
            throw new InvalidCredentialsException();
        }

        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            publishRefreshFailure(email, "unknown user");
            throw new InvalidCredentialsException();
        }

        if (!jwtService.isTokenValid(refreshToken, email)) {
            publishRefreshFailure(email, "invalid or expired token");
            throw new InvalidCredentialsException();
        }

        boolean rememberMe = Boolean.parseBoolean(
                jwtService.extractClaim(refreshToken, JwtService.CLAIM_REMEMBER_ME)
        );

        String newRefreshToken = jwtService.generateRefreshToken(email, rememberMe);

        try {
            refreshTokenService.rotate(
                    user.getId(),
                    refreshToken,
                    newRefreshToken,
                    jwtService.getRefreshTokenLifetime(rememberMe)
            );
        } catch (InvalidCredentialsException ex) {
            publishRefreshFailure(email, "token not registered, expired or reused");
            throw ex;
        }

        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_SUCCESS,
                user.getId(),
                user.getEmail(),
                null
        ));

        return buildAuthResponse(user, rememberMe, newRefreshToken);
    }

    private String issueRefreshToken(User user, boolean rememberMe) {
        long ttl = jwtService.getRefreshTokenLifetime(rememberMe);
        String raw = jwtService.generateRefreshToken(user.getEmail(), rememberMe);
        refreshTokenService.issue(user.getId(), raw, ttl);
        return raw;
    }

    private void publishRefreshFailure(String email, String detail) {
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_FAILURE,
                null,
                email,
                detail
        ));
    }

    private AuthResponse buildAuthResponse(User user, boolean rememberMe,
                                           String refreshToken) {
        Map<String, Object> claims = Map.of("role", user.getRole().name());
        String accessToken  = jwtService.generateAccessToken(user.getEmail(), claims);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900)
                .rememberMe(rememberMe)
                .user(userMapper.toSummary(user))
                .build();
    }
}