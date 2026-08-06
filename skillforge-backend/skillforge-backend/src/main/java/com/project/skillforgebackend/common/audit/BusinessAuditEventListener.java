package com.project.skillforgebackend.common.audit;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Writes business audit events as structured log lines enriched with the
 * request correlation id and client ip from the MDC, mirroring the auth
 * audit trail so a user's business actions can be reconstructed from logs.
 */
@Component
@Slf4j
public class BusinessAuditEventListener {

    @EventListener
    public void onBusinessEvent(BusinessAuditEvent event) {
        String requestId = MDC.get("requestId");
        String clientIp = MDC.get("clientIp");

        log.info(
                "BUSINESS_AUDIT type={} user={} entity={} entityId={} ip={} requestId={} detail={}",
                event.type(), event.userId(), event.entityType(), event.entityId(),
                clientIp != null ? clientIp : "-",
                requestId != null ? requestId : "-",
                event.detail()
        );
    }
}
