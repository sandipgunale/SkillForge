package com.project.skillforgebackend.quiz.service;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class QuizExpiryTest {

    @Test
    void expiryIsOneAndAHalfMinutesPerQuestion() {
        LocalDateTime now = LocalDateTime.now();

        var expiry = QuizGenerationService.calculateExpiry(10);

        Duration diff = Duration.between(now, expiry);

        assertThat(diff.toMinutes()).isEqualTo(15);
    }

    @Test
    void singleQuestionGetsMinimumTwoMinutes() {
        LocalDateTime now = LocalDateTime.now();

        var expiry = QuizGenerationService.calculateExpiry(1);

        Duration diff = Duration.between(now, expiry);

        assertThat(diff.toMinutes()).isEqualTo(2);
    }

    @Test
    void oddQuestionCountRoundsUp() {
        LocalDateTime now = LocalDateTime.now();

        var expiry = QuizGenerationService.calculateExpiry(3);

        Duration diff = Duration.between(now, expiry);

        // ceil(3 * 1.5) = 5 minutes
        assertThat(diff.toMinutes()).isEqualTo(5);
    }

    @Test
    void expiryIsInTheFuture() {
        assertThat(QuizGenerationService.calculateExpiry(5))
                .isAfter(LocalDateTime.now());
    }
}
