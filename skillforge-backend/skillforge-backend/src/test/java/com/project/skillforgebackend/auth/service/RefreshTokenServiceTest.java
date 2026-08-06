package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.auth.audit.AuthAuditEvent;
import com.project.skillforgebackend.auth.entity.RefreshToken;
import com.project.skillforgebackend.auth.repository.RefreshTokenRepository;
import com.project.skillforgebackend.common.exception.InvalidCredentialsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private static final UUID USER_ID = UUID.randomUUID();

    private RefreshToken liveToken(String hash, Instant expiresAt) {
        return RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(USER_ID)
                .tokenHash(hash)
                .expiresAt(expiresAt)
                .build();
    }

    @Test
    void issue_storesOnlyTheHash() {
        refreshTokenService.issue(USER_ID, "raw-token", 86_400_000L);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());

        RefreshToken saved = captor.getValue();
        assertThat(saved.getTokenHash()).isNotEqualTo("raw-token");
        assertThat(saved.getTokenHash()).hasSize(64);
        assertThat(saved.getRevokedAt()).isNull();
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());
    }

    @Test
    void rotate_revokesOldTokenAndIssuesSuccessor() {
        RefreshToken old = liveToken(RefreshTokenService.hash("old-raw"),
                Instant.now().plusSeconds(3600));
        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash("old-raw")))
                .thenReturn(Optional.of(old));

        String successor = refreshTokenService.rotate(USER_ID, "old-raw", 86_400_000L);

        assertThat(successor).isNotEqualTo("old-raw");
        assertThat(old.getRevokedAt()).isNotNull();

        ArgumentCaptor<RefreshToken> savedCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, times(2)).save(savedCaptor.capture());

        RefreshToken successorEntity = savedCaptor.getAllValues().get(1);
        assertThat(successorEntity.getTokenHash())
                .isEqualTo(RefreshTokenService.hash(successor));
        assertThat(successorEntity.getReplacedId()).isEqualTo(old.getId());
    }

    @Test
    void rotate_unknownTokenThrows() {
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.rotate(USER_ID, "unknown", 1000L))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void rotate_expiredTokenThrowsAndRevokesIt() {
        RefreshToken expired = liveToken(RefreshTokenService.hash("expired-raw"),
                Instant.now().minusSeconds(60));
        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash("expired-raw")))
                .thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> refreshTokenService.rotate(USER_ID, "expired-raw", 1000L))
                .isInstanceOf(InvalidCredentialsException.class);

        assertThat(expired.getRevokedAt()).isNotNull();
    }

    @Test
    void rotate_revokedTokenDetectsReuseAndRevokesFamily() {
        RefreshToken alreadyRotated = liveToken(
                RefreshTokenService.hash("stolen-raw"),
                Instant.now().plusSeconds(3600)
        );
        alreadyRotated.setRevokedAt(Instant.now().minusSeconds(10));

        RefreshToken stillLive = liveToken("other-hash", Instant.now().plusSeconds(3600));

        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash("stolen-raw")))
                .thenReturn(Optional.of(alreadyRotated));
        when(refreshTokenRepository.findByUserIdAndRevokedAtIsNull(USER_ID))
                .thenReturn(List.of(stillLive));

        assertThatThrownBy(() -> refreshTokenService.rotate(USER_ID, "stolen-raw", 1000L))
                .isInstanceOf(InvalidCredentialsException.class);

        // The live sibling must have been revoked too, and the reuse must be
        // flagged through the audit event stream.
        assertThat(stillLive.getRevokedAt()).isNotNull();
        verify(eventPublisher).publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_REUSE_DETECTED,
                USER_ID,
                null,
                "reuse of an already rotated refresh token"
        ));
        verify(eventPublisher).publishEvent(new AuthAuditEvent(
                AuthAuditEvent.Type.REFRESH_TOKENS_REVOKED,
                USER_ID,
                null,
                "all refresh tokens revoked after reuse detection"
        ));
    }

    @Test
    void revoke_marksOnlyOutstandingToken() {
        RefreshToken token = liveToken(RefreshTokenService.hash("raw"), Instant.now().plusSeconds(3600));
        when(refreshTokenRepository.findByTokenHash(RefreshTokenService.hash("raw")))
                .thenReturn(Optional.of(token));

        refreshTokenService.revoke("raw");

        assertThat(token.getRevokedAt()).isNotNull();
    }

    @Test
    void revoke_unknownTokenIsIgnored() {
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        refreshTokenService.revoke("nope");

        verify(refreshTokenRepository, never()).save(any());
    }
}