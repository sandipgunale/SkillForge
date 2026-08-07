package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.entity.RefreshToken;
import com.project.skillforgebackend.auth.repository.RefreshTokenRepository;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Server-side lifecycle of refresh tokens: issuance (hashed at rest),
 * single-use rotation and revocation.
 *
 * <p>Rotation: presenting a token marks it revoked and mints a successor.
 * Presenting an <em>already revoked</em> token is treated as theft — the
 * entire token family of that user is revoked (reuse detection, OWASP
 * recommendation). Logout revokes the presented token so the server can
 * actively reject it afterwards.
 */
@Service
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Registers a newly issued raw refresh token (created by
     * {@link JwtService}) so it can later be rotated and revoked.
     */
    @Transactional
    public void issue(UUID userId, String rawToken, long ttlMillis) {
        RefreshToken entity = RefreshToken.builder()
                .userId(userId)
                .tokenHash(hash(rawToken))
                .expiresAt(Instant.now().plusMillis(ttlMillis))
                .build();
        refreshTokenRepository.save(entity);
    }

    /**
     * Rotates the presented token: validates it against the store, revokes it
     * and registers the caller-provided successor token.
     *
     * <p>Runs in a transaction that does <em>not</em> roll back on
     * {@link InvalidCredentialsException}: the family revocation performed
     * for reuse detection must survive the 401 response (the request fails,
     * but the security response — revoking the whole token family — must
     * commit). The caller ({@link AuthService}) declares the same rule so
     * the joined transaction stays committable.
     *
     * @throws InvalidCredentialsException when the token is unknown, expired
     *                                     or already rotated. An already
     *                                     rotated token additionally revokes
     *                                     the whole family (reuse detection).
     */
    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public void rotate(UUID userId, String rawToken, String rawSuccessor, long ttlMillis) {
        RefreshToken entity = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(InvalidCredentialsException::new);

        if (entity.getRevokedAt() != null) {
            revokeFamily(userId, rawToken);
            throw new InvalidCredentialsException();
        }

        if (entity.getExpiresAt().isBefore(Instant.now())) {
            entity.setRevokedAt(Instant.now());
            refreshTokenRepository.save(entity);
            throw new InvalidCredentialsException();
        }

        entity.setRevokedAt(Instant.now());
        refreshTokenRepository.save(entity);

        RefreshToken successor = RefreshToken.builder()
                .userId(userId)
                .tokenHash(hash(rawSuccessor))
                .expiresAt(Instant.now().plusMillis(ttlMillis))
                .replacedId(entity.getId())
                .build();
        refreshTokenRepository.save(successor);
    }

    /**
     * Best-effort revocation of a presented token (logout). Unknown tokens
     * are ignored — the caller is already signed out cookie-wise.
     */
    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> token.getRevokedAt() == null)
                .ifPresent(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                    log.info("Refresh token revoked for user {}", token.getUserId());
                });
    }

    /**
     * Revokes every outstanding token of a user (compromise response).
     */
    @Transactional
    public void revokeAll(UUID userId) {
        refreshTokenRepository.findByUserIdAndRevokedAtIsNull(userId)
                .forEach(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
    }

    private void revokeFamily(UUID userId, String reusedRawToken) {
        log.warn("Refresh-token reuse detected for user {} — revoking all tokens", userId);
        revokeAll(userId);
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_REUSE_DETECTED,
                userId,
                null,
                "reuse of an already rotated refresh token"
        ));
        eventPublisher.publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_TOKENS_REVOKED,
                userId,
                null,
                "all refresh tokens revoked after reuse detection"
        ));
    }

    /**
     * Nightly purge of rotated/expired rows (keep the table bounded).
     */
    @Scheduled(cron = "0 15 0 * * *")
    @Transactional
    public void purgeExpired() {
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        long deleted = refreshTokenRepository.deleteByExpiresAtBefore(cutoff);
        if (deleted > 0) {
            log.info("Purged {} expired refresh-token rows", deleted);
        }
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(rawToken.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
