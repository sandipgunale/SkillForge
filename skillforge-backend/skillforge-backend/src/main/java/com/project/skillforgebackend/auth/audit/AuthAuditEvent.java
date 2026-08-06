package com.project.skillforgebackend.auth.audit;

import java.util.UUID;

/**
 * Authentication lifecycle event published via
 * {@link org.springframework.context.ApplicationEventPublisher} and consumed
 * by {@link AuthAuditEventListener}.
 *
 * <p>Never carries credentials or tokens — only identity references and the
 * failure/outcome category. The request id and client ip are picked up from
 * the SLF4J MDC at the consumer side (see {@code RequestIdFilter}).
 */
public record AuthAuditEvent(
        Type type,
        UUID userId,
        String email,
        String detail
) {

    public enum Type {
        REGISTER_SUCCESS,
        LOGIN_SUCCESS,
        LOGIN_FAILURE,
        LOGOUT_SUCCESS,
        REFRESH_SUCCESS,
        REFRESH_FAILURE,
        REFRESH_REUSE_DETECTED,
        PASSWORD_RESET_REQUESTED,
        PASSWORD_RESET_COMPLETED,
        REFRESH_TOKENS_REVOKED
    }
}
