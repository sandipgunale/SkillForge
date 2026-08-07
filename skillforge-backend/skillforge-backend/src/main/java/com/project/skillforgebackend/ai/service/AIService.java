package com.project.skillforgebackend.ai.service;

import com.project.skillforgebackend.ai.cache.AiResponseCache;
import com.project.skillforgebackend.ai.guardrail.AiPromptGuard;
import com.project.skillforgebackend.ai.parser.EvaluationParser;
import com.project.skillforgebackend.ai.parser.QuizParser;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.prompt.EvaluationPromptBuilder;
import com.project.skillforgebackend.ai.prompt.LearningPathPromptBuilder;
import com.project.skillforgebackend.ai.prompt.QuizPromptBuilder;
import com.project.skillforgebackend.ai.parser.LearningPathParser;
import com.project.skillforgebackend.ai.resilience.AiResilienceExecutor;
import com.project.skillforgebackend.config.properties.GeminiProperties;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final QuizParser quizParser;
    private final EvaluationParser evaluationParser;
    private final QuizPromptBuilder quizPromptBuilder;
    private final LearningPathPromptBuilder learningPathPromptBuilder;
    private final LearningPathParser learningPathParser;
    private final EvaluationPromptBuilder evaluationPromptBuilder;
    private final AiResilienceExecutor aiResilienceExecutor;
    private final GeminiProperties geminiProperties;
    private final AiPromptGuard promptGuard;
    private final AiResponseCache responseCache;

    /**
     * Generates quiz questions via the AI provider.
     */
    public List<Question> generateQuestions(
            String topicName,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types) {

        promptGuard.guardField(topicName, "Topic");
        promptGuard.guardQuestionCount(count);

        String prompt = quizPromptBuilder.build(
                promptGuard.guardField(topicName, "Topic"),
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

        if (topics == null || topics.isEmpty()) {
            throw new IllegalArgumentException("Topics must not be empty.");
        }

        promptGuard.guardQuestionCount(count);

        List<String> guardedTopics = topics.stream()
                .map(topic -> promptGuard.guardField(topic, "Topic"))
                .toList();

        String prompt = quizPromptBuilder.build(
                guardedTopics,
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
     * {@link com.project.skillforgebackend.ai.client.GeminiClient} (model
     * rotation), so only parse failures land here.
     */
    private List<Question> completeWithParseRetry(
            String prompt,
            String purpose
    ) {
        promptGuard.guardPromptLength(prompt);

        int attempts = Math.max(1, geminiProperties.maxParseRetries() + 1);

        Exception lastFailure = null;

        for (int attempt = 1; attempt <= attempts; attempt++) {

            String response = aiResilienceExecutor.complete(prompt);

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
     * Evaluates a completed quiz using AI.
     */
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        String prompt = evaluationPromptBuilder.build(quiz);

        promptGuard.guardPromptLength(prompt);

        String response = aiResilienceExecutor.complete(prompt);

        return parseOrThrow(
                () -> evaluationParser.parse(response, quiz),
                "Failed to evaluate quiz."
        );
    }

    public String generateLearningPath(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {

        String safeTitle = promptGuard.guardField(title, "Roadmap title");
        String safeGoal = promptGuard.guardField(goal, "Goal");
        String safeSkillLevel = promptGuard.guardField(skillLevel, "Skill level");

        String cacheKey = responseCache.key(
                safeTitle,
                safeGoal,
                safeSkillLevel,
                weeklyHours,
                durationWeeks
        );

        Optional<String> cached = responseCache.getLearningPath(cacheKey);

        if (cached.isPresent()) {

            log.info("Serving cached learning path for identical request.");

            return cached.get();
        }

        String prompt = learningPathPromptBuilder.build(
                safeTitle,
                safeGoal,
                safeSkillLevel,
                weeklyHours,
                durationWeeks
        );

        promptGuard.guardPromptLength(prompt);

        String response = aiResilienceExecutor.complete(prompt);

        String roadmap = parseOrThrow(
                () -> learningPathParser.parse(response),
                "Failed to generate learning path."
        );

        responseCache.putLearningPath(cacheKey, roadmap);

        return roadmap;
    }

    /**
     * Wraps a parse failure in an {@link AIServiceException} with a stable
     * message. The completion call itself already translates resilience
     * failures into {@link AIServiceException}, which pass through.
     */
    private <T> T parseOrThrow(
            Supplier<T> parse,
            String failureMessage
    ) {
        try {
            return parse.get();
        } catch (AIServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error(failureMessage, ex);
            throw new AIServiceException(failureMessage, ex);
        }
    }
}