package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.dto.ForgotPasswordRequest;
import com.project.skillforgebackend.auth.dto.ResetPasswordRequest;
import com.project.skillforgebackend.auth.entity.PasswordResetToken;
import com.project.skillforgebackend.auth.repository.PasswordResetTokenRepository;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import com.project.skillforgebackend.config.properties.AppProperties;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

/**
 * Password reset flow with hashed, expiring, single-use tokens.
 * The raw token is only ever returned in the (log or mail) reset link;
 * the database stores its SHA-256 hash.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties appProperties;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Always returns normally — a 200 for an unknown email would leak
     * registered addresses. Invalidates any prior unused tokens for the user.
     */
    @Transactional
    public void requestReset(ForgotPasswordRequest request) {
        String email = request.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.info("Password reset requested for unknown email {}", email);
            return;
        }

        tokenRepository.findByUserIdAndUsedAtIsNull(user.getId())
                .forEach(tokenRepository::delete);

        String rawToken = generateToken();
        long ttlMinutes = appProperties.passwordResetTtlMinutes();
        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(hash(rawToken))
                .expiresAt(Instant.now().plus(ttlMinutes, ChronoUnit.MINUTES))
                .build();
        tokenRepository.save(entity);

        mailService.sendPasswordResetEmail(user.getEmail(), rawToken);
        log.info("Password reset requested for {}", email);
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.PASSWORD_RESET_REQUESTED,
                user.getId(),
                user.getEmail(),
                null
        ));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken entity = tokenRepository
                .findTopByTokenHashOrderByCreatedAtDesc(hash(request.token().trim()))
                .orElseThrow(InvalidCredentialsException::new);

        if (entity.getUsedAt() != null
                || entity.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        entity.setUsedAt(Instant.now());
        tokenRepository.save(entity);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Password reset completed for {}", user.getEmail());
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.PASSWORD_RESET_COMPLETED,
                user.getId(),
                user.getEmail(),
                null
        ));
    }

    /** Nightly purge of expired / consumed tokens. */
    @Scheduled(cron = "0 30 0 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        int removed = tokenRepository.purgeExpiredOrUsed(
                Instant.now().minus(7, ChronoUnit.DAYS)
        );
        if (removed > 0) {
            log.info("Purged {} password reset tokens", removed);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    static String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(
                    digest.digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Password reset is unavailable", ex);
        }
    }
}
