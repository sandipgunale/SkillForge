package com.project.skillforgebackend.auth.audit;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Writes authentication audit events as structured, correlation-friendly log
 * lines. Each entry carries the event type, user, request id and client ip so
 * an account's authentication history can be reconstructed from the logs
 * without scraping full access logs.
 *
 * <p>Sensitive events (failures, reuse detection, revocation) are logged at
 * WARN; routine successes at INFO.
 */
@Component
@Slf4j
public class AuthAuditEventListener {

    @EventListener
    public void onAuthEvent(AuthAuditEvent event) {
        String requestId = MDC.get("requestId");
        String clientIp = MDC.get("clientIp");

        if (event.type() == AuthAuditEvent.Type.LOGIN_FAILURE
                || event.type() == AuthAuditEvent.Type.REFRESH_FAILURE
                || event.type() == AuthAuditEvent.Type.REFRESH_REUSE_DETECTED
                || event.type() == AuthAuditEvent.Type.REFRESH_TOKENS_REVOKED) {
            log.warn(
                    "AUTH_AUDIT type={} user={} email={} ip={} requestId={} detail={}",
                    event.type(), event.userId(), event.email(),
                    clientIp != null ? clientIp : "-",
                    requestId != null ? requestId : "-",
                    event.detail()
            );
            return;
        }

        log.info(
                "AUTH_AUDIT type={} user={} email={} ip={} requestId={} detail={}",
                event.type(), event.userId(), event.email(),
                clientIp != null ? clientIp : "-",
                requestId != null ? requestId : "-",
                event.detail()
        );
    }
}
