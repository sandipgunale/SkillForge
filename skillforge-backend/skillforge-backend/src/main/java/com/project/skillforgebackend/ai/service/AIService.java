package com.project.skillforgebackend.ai.service;

import com.project.skillforgebackend.ai.client.GeminiClient;
import com.project.skillforgebackend.ai.parser.EvaluationParser;
import com.project.skillforgebackend.ai.parser.QuizParser;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.dto.*;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.decorators.Decorators;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.project.skillforgebackend.ai.prompt.QuizPromptBuilder;
import com.project.skillforgebackend.ai.prompt.LearningPathPromptBuilder;
import com.project.skillforgebackend.ai.prompt.EvaluationPromptBuilder;
import com.project.skillforgebackend.ai.parser.LearningPathParser;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeoutException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final GeminiClient geminiClient;
    private final QuizParser quizParser;
    private final EvaluationParser evaluationParser;
    private final QuizPromptBuilder quizPromptBuilder;
    private final LearningPathPromptBuilder learningPathPromptBuilder;
    private final LearningPathParser learningPathParser;
    private final EvaluationPromptBuilder evaluationPromptBuilder;

    private final CircuitBreaker aiCircuitBreaker;

    private final Retry aiRetry;

    private final TimeLimiter aiTimeLimiter;

    private final ExecutorService aiExecutor;

    private final java.util.concurrent.ScheduledExecutorService aiTimeoutScheduler;

    private final MeterRegistry meterRegistry;

    @Value("${gemini.max-parse-retries:2}")
    private int maxParseRetries;

    /**
     * Generates quiz questions via Gemini.
     */
    public List<Question> generateQuestions(
            String topicName,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types) {

        String prompt = quizPromptBuilder.build(
                topicName,
                difficulty,
                count,
                types
        );

        return completeWithParseRetry(
                prompt,
                "quiz questions"
        );
    }


    public List<Question> generateQuestions(
            List<String> topics,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ) {

        String prompt = quizPromptBuilder.build(
                topics,
                difficulty,
                count,
                types
        );

        return completeWithParseRetry(
                prompt,
                "learning path quiz"
        );
    }

    /**
     * Schema validation retry loop: a malformed AI payload is not fatal —
     * the same prompt is re-sent until it validates or the retry budget
     * is exhausted. Transport/rate-limit failures are handled inside
     * {@link GeminiClient} (model rotation), so only parse failures land
     * here.
     */
    private List<Question> completeWithParseRetry(
            String prompt,
            String purpose
    ) {
        int attempts = Math.max(1, maxParseRetries + 1);

        Exception lastFailure = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {

            String response = completeWithResilience(prompt);

            try {

                return quizParser.parse(response);

            } catch (Exception ex) {

                lastFailure = ex;

                log.warn(
                        "Schema validation failed for {} (attempt {}/{}): {}",
                        purpose,
                        attempt,
                        attempts,
                        ex.getMessage()
                );
            }
        }

        throw new AIServiceException(
                "Failed to generate " + purpose
                        + " after " + attempts + " attempts.",
                lastFailure
        );
    }


    /**
     * Runs a Gemini call through the resilience chain (circuit breaker,
     * retry for transient transport failures, wall-clock time limit).
     * All failures are surfaced as {@link AIServiceException} so callers
     * never depend on resilience4j types.
     */
    private String completeWithResilience(String prompt) {

        Timer.Sample sample = Timer.start(meterRegistry);

        try {

            String result = executeResilientCall(prompt);

            sample.stop(aiCallTimer("success"));

            return result;

        } catch (AIServiceException ex) {

            sample.stop(aiCallTimer("failure"));

            throw ex;

        } catch (RuntimeException ex) {

            sample.stop(aiCallTimer("failure"));

            throw translateAiFailure(unwrap(ex));

        }
    }

    private Timer aiCallTimer(String outcome) {
        return Timer.builder("skillforge_ai_call_duration")
                .description("Wall-clock duration of an outbound AI call")
                .tag("outcome", outcome)
                .register(meterRegistry);
    }

    private String executeResilientCall(String prompt) {

        java.util.function.Supplier<String> call = Retry.decorateSupplier(
                aiRetry,
                CircuitBreaker.decorateSupplier(
                        aiCircuitBreaker,
                        () -> geminiClient.complete(prompt)
                )
        );

        return Decorators.ofCompletionStage(
                        () -> CompletableFuture.supplyAsync(call, aiExecutor)
                )
                .withTimeLimiter(aiTimeLimiter, aiTimeoutScheduler)
                .get()
                .toCompletableFuture()
                .join();
    }

    private Throwable unwrap(Throwable throwable) {

        Throwable current = throwable;

        while ((current instanceof CompletionException)
                && current.getCause() != null) {

            current = current.getCause();
        }

        return current;
    }

    private AIServiceException translateAiFailure(Throwable cause) {

        if (cause instanceof AIServiceException aiException) {

            return aiException;
        }

        if (cause instanceof CallNotPermittedException) {

            log.warn("AI circuit breaker open; rejecting call.");

            return new AIServiceException(
                    "The AI service is temporarily unavailable. "
                            + "Please try again later.",
                    cause
            );
        }

        if (cause instanceof TimeoutException) {

            log.warn("AI call timed out after the configured limit.");

            return new AIServiceException(
                    "The AI service took too long to respond. "
                            + "Please try again later.",
                    cause
            );
        }

        return new AIServiceException(
                "Failed to communicate with the AI service.",
                cause
        );
    }


    /**
     * Evaluates a completed quiz using AI.
     */
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        String prompt = evaluationPromptBuilder.build(quiz);
        String response = completeWithResilience(prompt);
        try {

            return evaluationParser.parse(response, quiz);

        } catch (Exception ex) {

            log.error("Failed to evaluate quiz.", ex);

            throw new AIServiceException(
                    "Failed to evaluate quiz.",
                    ex
            );
        }
    }

    public String generateLearningPath(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {

        String prompt = learningPathPromptBuilder.build(
                title,
                goal,
                skillLevel,
                weeklyHours,
                durationWeeks
        );

        String response = completeWithResilience(prompt);

        try {

            return learningPathParser.parse(response);

        } catch (Exception ex) {

            log.error("Failed to generate learning path.", ex);

            throw new AIServiceException(
                    "Failed to generate learning path.",
                    ex
            );
        }
    }


}