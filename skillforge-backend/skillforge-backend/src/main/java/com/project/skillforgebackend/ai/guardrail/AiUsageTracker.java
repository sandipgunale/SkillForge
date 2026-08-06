package com.project.skillforgebackend.ai.guardrail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cost guardrail: caps the number of AI-generated questions a single
 * user may request per rolling day. Kept in memory (single-node app),
 * scoped to a {@link LocalDate} key with a nightly purge.
 */
@Component
@Slf4j
public class AiUsageTracker {

    @Value("${gemini.max-questions-per-day:200}")
    private int maxQuestionsPerDay;

    private final Map<UUID, Map<LocalDate, Integer>> usage =
            new ConcurrentHashMap<>();

    /**
     * Test-friendly constructor.
     */
    AiUsageTracker(int maxQuestionsPerDay) {
        this.maxQuestionsPerDay = maxQuestionsPerDay;
    }

    public AiUsageTracker() {
        // spring-managed
    }

    /**
     * Atomically consume {@code requestedCount} questions; throws when
     * the user would exceed the daily quota.
     */
    public void consume(UUID userId, int requestedCount) {
        LocalDate today = LocalDate.now();

        Map<LocalDate, Integer> userUsage =
                usage.computeIfAbsent(userId, key ->
                        new ConcurrentHashMap<>());

        Integer used = userUsage.computeIfAbsent(today, key -> 0);

        if (used + requestedCount > maxQuestionsPerDay) {
            int remaining = Math.max(0, maxQuestionsPerDay - used);

            throw new QuestionQuotaExceededException(
                    "Daily AI question limit reached. "
                            + remaining
                            + " question"
                            + (remaining == 1 ? "" : "s")
                            + " remaining today."
            );
        }

        userUsage.put(today, used + requestedCount);

        log.info(
                "AI usage for user {} on {}: {}/{}",
                userId,
                today,
                used + requestedCount,
                maxQuestionsPerDay
        );
    }

    public int getRemaining(UUID userId) {
        Map<LocalDate, Integer> userUsage =
                usage.get(userId);

        if (userUsage == null) {
            return maxQuestionsPerDay;
        }

        Integer used = userUsage.getOrDefault(LocalDate.now(), 0);

        return Math.max(0, maxQuestionsPerDay - used);
    }

    /** Drop entries older than today to keep memory bounded. */
    @Scheduled(cron = "0 5 0 * * *")
    public void purgeExpired() {
        usage.values().forEach(userUsage ->
                userUsage.keySet().removeIf(day -> !day.isEqual(LocalDate.now()))
        );

        usage.entrySet().removeIf(entry -> entry.getValue().isEmpty());
    }
}