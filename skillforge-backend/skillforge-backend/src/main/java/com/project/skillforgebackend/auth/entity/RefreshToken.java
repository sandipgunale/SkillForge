package com.project.skillforgebackend.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Server-side record of a refresh token, enabling rotation and revocation.
 *
 * <p>Only the SHA-256 hash of the raw token is persisted (same policy as
 * {@link PasswordResetToken}). On every successful {@code /refresh} the
 * presented token is marked revoked and a successor row is written; the
 * previously issued successor is linked via {@code replacedById}, forming a
 * chain for forensic reconstruction of a stolen-token incident.
 */
@Entity
@Table(
        name = "refresh_tokens",
        indexes = {
                @Index(name = "idx_refresh_tokens_user", columnList = "user_id"),
                @Index(name = "idx_refresh_tokens_expiry", columnList = "expires_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false, length = 64, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    /** Id of the token row this one replaced (rotation chain). */
    @Column(name = "replaced_id")
    private UUID replacedId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}