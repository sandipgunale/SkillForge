package com.project.skillforgebackend.common.security;

import com.project.skillforgebackend.common.exception.RateLimitException;
import com.project.skillforgebackend.config.properties.RateLimitProperties;
import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RateLimiterTest {

    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp() {
        rateLimiter = new RateLimiter(
                new RateLimitProperties(true, 3, 10L, null),
                null
        );
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
        RateLimiter disabled = new RateLimiter(
                new RateLimitProperties(false, 3, 10L, null),
                null
        );

        for (int i = 0; i < 100; i++) {
            disabled.check(disabled.key("127.0.0.1", "login"));
        }
    }

    @Test
    void exhaustedBucketSchedulesRefill() {
        String key = rateLimiter.key("127.0.0.1", "login");

        rateLimiter.check(key);
        rateLimiter.check(key);
        rateLimiter.check(key);

        ConsumptionProbe probe = rateLimiter.probe(key);

        assertThat(probe.isConsumed()).isFalse();
        assertThat(probe.getNanosToWaitForRefill()).isGreaterThan(0);
    }

    @Test
    void freshLimiterStartsWithFullBudget() {
        String key = rateLimiter.key("10.0.0.1", "login");

        rateLimiter.check(key);
        rateLimiter.check(key);
        rateLimiter.check(key);

        assertThatThrownBy(() -> rateLimiter.check(key))
                .isInstanceOf(RateLimitException.class);

        // A fresh proxy manager (e.g. instance restart, or a shared store
        // that is reset) starts with a full token budget again
        RateLimiter fresh = new RateLimiter(
                new RateLimitProperties(true, 3, 10L, null),
                null
        );

        fresh.check(key);
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
