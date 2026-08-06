package com.project.skillforgebackend.ai.service;

import com.project.skillforgebackend.ai.client.GeminiClient;
import com.project.skillforgebackend.ai.parser.EvaluationParser;
import com.project.skillforgebackend.ai.parser.QuizParser;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.dto.*;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.project.skillforgebackend.ai.prompt.QuizPromptBuilder;
import com.project.skillforgebackend.ai.prompt.LearningPathPromptBuilder;
import com.project.skillforgebackend.ai.prompt.EvaluationPromptBuilder;
import com.project.skillforgebackend.ai.parser.LearningPathParser;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

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

            String response = geminiClient.complete(prompt);

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
        String response = geminiClient.complete(prompt);
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

        String response = geminiClient.complete(prompt);

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