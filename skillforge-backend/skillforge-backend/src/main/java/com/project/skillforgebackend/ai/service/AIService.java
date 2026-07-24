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

    /**
     * Generates quiz questions using OpenAI.
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
        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");
        String response = geminiClient.complete(prompt);
        log.info("========== RAW GEMINI RESPONSE ==========");
        log.info(response);
        log.info("=========================================");
        try {

            return quizParser.parse(response);

        } catch (Exception ex) {

            log.error("Failed to parse generated questions.", ex);

            throw new AIServiceException(
                    "Failed to generate quiz questions.",
                    ex
            );
        }
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

        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");

        String response = geminiClient.complete(prompt);

        log.info("========== RAW GEMINI RESPONSE ==========");
        log.info(response);
        log.info("=========================================");

        try {

            return quizParser.parse(response);

        } catch (Exception ex) {

            throw new AIServiceException(
                    "Failed to generate learning path quiz.",
                    ex
            );

        }

    }


    /**
     * Evaluates a completed quiz using AI.
     */
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        String prompt = evaluationPromptBuilder.build(quiz);
        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");
        String response = geminiClient.complete(prompt);
        log.info("Raw OpenAI Response:\n{}", response);
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

        log.info("========== PROMPT ==========");
        log.info(prompt);
        log.info("============================");

        String response = geminiClient.complete(prompt);

        log.info("Raw Gemini Response:\n{}", response);

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