package com.project.skillforgebackend.config;

import com.project.skillforgebackend.config.properties.AppProperties;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Allows {@code /actuator/prometheus} only from explicitly configured
 * IPs/CIDRs ({@code app.monitoring.allowed-ips}). Requests from any other
 * address do not match this matcher and fall through to the default
 * authenticated rule, so the scrape endpoint is never publicly readable.
 *
 * The scraper runs server-side, so no CORS involvement. The empty default
 * ({@code METRICS_ALLOWED_IPS} unset) effectively disables the endpoint.
 */
@Component
@Slf4j
public class MetricsAccess implements RequestMatcher {

    private static final String PROMETHEUS_PATH = "/actuator/prometheus";

    private final List<IpAddressMatcher> matchers = new ArrayList<>();

    private final List<String> allowedIps;

    public MetricsAccess(AppProperties appProperties) {
        this.allowedIps = appProperties.monitoring() == null
                ? List.of()
                : appProperties.monitoring().allowedIps();
    }

    @PostConstruct
    void init() {

        for (String cidr : allowedIps) {

            String trimmed = cidr.trim();

            if (!trimmed.isEmpty()) {

                matchers.add(new IpAddressMatcher(trimmed));
            }
        }

        if (matchers.isEmpty()) {

            log.warn(
                    "app.monitoring.allowed-ips is empty: "
                            + "/actuator/prometheus rejects every request"
            );
        }
    }

    @Override
    public boolean matches(HttpServletRequest request) {

        if (!PROMETHEUS_PATH.equals(request.getRequestURI())) {

            return false;
        }

        return matchers.stream()
                .anyMatch(matcher -> matcher.matches(request));
    }
}
