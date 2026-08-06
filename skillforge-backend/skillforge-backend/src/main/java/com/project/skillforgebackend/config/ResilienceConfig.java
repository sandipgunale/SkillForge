package com.project.skillforgebackend.config;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.core.IntervalFunction;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.ResourceAccessException;

import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * Resilience4j wiring for outbound AI calls (Gemini).
 *
 * <ul>
 *   <li><b>Circuit breaker</b> — stops hammering a degraded AI provider
 *       (5 failures in a 10-call window over 50% opens the circuit).</li>
 *   <li><b>Retry</b> — only transient transport failures are retried
 *       ({@link ResourceAccessException} wrapped in {@link AIServiceException}).
 *       HTTP-level errors (4xx) and parse failures are never retried here;
 *       per-model quota rotation already happens inside GeminiClient.</li>
 *   <li><b>Time limiter</b> — bounds the worst-case wall-clock time of the
 *       whole call (incl. GeminiClient's internal model rotation), which
 *       would otherwise be unbounded.</li>
 * </ul>
 *
 * Config is intentionally programmatic (not resilience4j.* properties) so
 * the retry predicate, which depends on domain exceptions, stays close to
 * the beans it configures.
 */
@Configuration
public class ResilienceConfig {

    public static final String AI_BACKEND = "aiBackend";

    @Bean
    public CircuitBreaker aiCircuitBreaker() {
        return CircuitBreaker.of(AI_BACKEND, CircuitBreakerConfig.custom()
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .failureRateThreshold(50.0f)
                .waitDurationInOpenState(Duration.ofSeconds(20))
                .permittedNumberOfCallsInHalfOpenState(3)
                .build());
    }

    @Bean
    public Retry aiRetry() {
        return Retry.of(AI_BACKEND, RetryConfig.custom()
                .maxAttempts(3)
                .intervalFunction(IntervalFunction.ofExponentialBackoff(
                        Duration.ofMillis(500),
                        2.0,
                        Duration.ofSeconds(5)
                ))
                .retryOnException(ResilienceConfig::isTransientAiFailure)
                .build());
    }

    @Bean
    public TimeLimiter aiTimeLimiter() {
        return TimeLimiter.of(TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(100))
                .build());
    }

    @Bean(destroyMethod = "shutdownNow")
    public ExecutorService aiExecutor() {
        return Executors.newFixedThreadPool(4, runnable -> {
            Thread thread = new Thread(runnable, "ai-call");
            thread.setDaemon(true);
            return thread;
        });
    }

    @Bean(destroyMethod = "shutdownNow")
    public ScheduledExecutorService aiTimeoutScheduler() {
        return Executors.newSingleThreadScheduledExecutor(runnable -> {
            Thread thread = new Thread(runnable, "ai-timeout");
            thread.setDaemon(true);
            return thread;
        });
    }

    private static boolean isTransientAiFailure(Throwable ex) {
        return ex instanceof AIServiceException aiEx
                && aiEx.getCause() instanceof ResourceAccessException;
    }
}
