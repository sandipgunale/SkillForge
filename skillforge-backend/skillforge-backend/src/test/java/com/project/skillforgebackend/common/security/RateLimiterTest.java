package com.project.skillforgebackend.common.security;

import com.project.skillforgebackend.common.exception.RateLimitException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RateLimiterTest {

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiter();
        ReflectionTestUtils.setField(rateLimiter, "enabled", true);
        ReflectionTestUtils.setField(rateLimiter, "maxRequests", 3);
        ReflectionTestUtils.setField(rateLimiter, "windowMinutes", 10L);
    }

    @Test
    void allowsRequestsUpToLimit() {
        String key = rateLimiter.key("127.0.0.1", "login");

        rateLimiter.check(key);
        rateLimiter.check(key);
        rateLimiter.check(key);
        // third check still within limit (3 allowed) — no exception
    }

    @Test
    void throwsWhenLimitExceeded() {
        String key = rateLimiter.key("127.0.0.1", "login");

        rateLimiter.check(key);
        rateLimiter.check(key);
        rateLimiter.check(key);

        assertThatThrownBy(() -> rateLimiter.check(key))
                .isInstanceOf(RateLimitException.class);
    }

    @Test
    void differentKeysAreIndependent() {
        rateLimiter.check(rateLimiter.key("1.1.1.1", "login"));
        rateLimiter.check(rateLimiter.key("1.1.1.1", "login"));
        rateLimiter.check(rateLimiter.key("1.1.1.1", "login"));

        assertThatThrownBy(() -> rateLimiter.check(rateLimiter.key("1.1.1.1", "login")))
                .isInstanceOf(RateLimitException.class);

        // Different IP is unaffected
        rateLimiter.check(rateLimiter.key("2.2.2.2", "login"));
    }

    @Test
    void disabledLimiterNeverThrows() {
        ReflectionTestUtils.setField(rateLimiter, "enabled", false);

        for (int i = 0; i < 100; i++) {
            rateLimiter.check(rateLimiter.key("127.0.0.1", "login"));
        }
    }

    @Test
    void windowResetsAfterElapsedTime() {
        String key = rateLimiter.key("127.0.0.1", "login");

        rateLimiter.check(key);
        rateLimiter.check(key);
        rateLimiter.check(key);

        assertThatThrownBy(() -> rateLimiter.check(key))
                .isInstanceOf(RateLimitException.class);

        // Simulate the window elapsing
        ReflectionTestUtils.setField(rateLimiter, "windowMinutes", 0L);

        // Old window is now stale -> new window opens
        rateLimiter.check(key);
    }

    @Test
    void keyIncludesEndpoint() {
        String ipLogin = rateLimiter.key("10.0.0.1", "login");
        String ipRegister = rateLimiter.key("10.0.0.1", "register");

        assertThat(ipLogin).contains("10.0.0.1").contains("login");
        assertThat(ipRegister).contains("10.0.0.1").contains("register");
        assertThat(ipLogin).isNotEqualTo(ipRegister);
    }
}
