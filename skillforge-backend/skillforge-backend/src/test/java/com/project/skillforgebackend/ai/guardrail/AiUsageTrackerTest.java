package com.project.skillforgebackend.ai.guardrail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiUsageTrackerTest {

    private AiUsageTracker tracker;

    @BeforeEach
    void setUp() {
        tracker = new AiUsageTracker(10);
    }

    @Test
    void consumeWithinQuotaSucceeds() {
        UUID userId = UUID.randomUUID();

        tracker.consume(userId, 4);
        tracker.consume(userId, 6);

        assertThat(tracker.getRemaining(userId)).isZero();
    }

    @Test
    void consumeOverQuotaThrows() {
        UUID userId = UUID.randomUUID();

        tracker.consume(userId, 8);

        assertThatThrownBy(() -> tracker.consume(userId, 3))
                .isInstanceOf(QuestionQuotaExceededException.class)
                .hasMessageContaining("Daily AI question limit reached");

        // Consumption that failed must not be counted
        assertThat(tracker.getRemaining(userId)).isEqualTo(2);
    }

    @Test
    void usersAreIndependent() {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        tracker.consume(userA, 10);

        assertThat(tracker.getRemaining(userA)).isZero();
        assertThat(tracker.getRemaining(userB)).isEqualTo(10);
    }

    @Test
    void remainingStartsAtMax() {
        assertThat(tracker.getRemaining(UUID.randomUUID()))
                .isEqualTo(10);
    }
}
