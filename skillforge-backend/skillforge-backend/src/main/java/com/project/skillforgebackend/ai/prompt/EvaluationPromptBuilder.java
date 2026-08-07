package com.project.skillforgebackend.ai.prompt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Builds quiz-evaluation prompts from the versioned template
 * {@code ai/prompts/evaluation.txt}. The static instruction sections live
 * in the template; the per-quiz question dump stays in Java because it is
 * assembled from the live entity graph.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EvaluationPromptBuilder {

    private static final String TEMPLATE = "ai/prompts/evaluation.txt";

    private final ObjectMapper objectMapper;

    private final PromptTemplateLoader templateLoader;

    public String build(Quiz quiz) {

        String quizTopic = quiz.getSource() == QuizSource.TOPIC
                ? quiz.getTopic().getName()
                : quiz.getLearningPath().getTitle();

        return templateLoader.render(
                TEMPLATE,
                Map.of(
                        "QUIZ_TOPIC", quizTopic,
                        "QUIZ_DIFFICULTY", quiz.getDifficulty().name(),
                        "QUESTIONS_SECTION", buildQuestions(quiz)
                )
        );
    }

    /**
     * Build Question Section
     */
    private String buildQuestions(Quiz quiz) {

        StringBuilder builder = new StringBuilder();

        builder.append("\n");

        builder.append("""
==========================================================
QUESTIONS
==========================================================

""");

        int index = 1;

        for (Question question : quiz.getQuestions()) {

            builder.append("Question ").append(index++).append("\n");

            builder.append("Question ID : ")
                    .append(question.getId())
                    .append("\n");

            builder.append("Type : ")
                    .append(question.getType())
                    .append("\n\n");

            switch (question.getType()) {

                case MCQ -> {

                    builder.append("""
Question

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Options

""");

                    builder.append(formatOptions(question.getOptionsJson()))
                            .append("\n");

                    builder.append("Correct Answer\n\n");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("User Answer\n\n");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case CODING -> {

                    builder.append("""
Coding Problem

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Expected Solution

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Solution

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case INTERVIEW -> {

                    builder.append("""
Interview Question

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Ideal Answer

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Answer

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }

                case SCENARIO -> {

                    builder.append("""
Scenario

""");

                    builder.append(question.getContent())
                            .append("\n\n");

                    builder.append("""
Expected Engineering Approach

""");

                    builder.append(question.getCorrectAnswer())
                            .append("\n\n");

                    builder.append("""
Candidate Response

""");

                    builder.append(question.getUserAnswer())
                            .append("\n\n");
                }
            }

            builder.append("""
----------------------------------------------------------

""");
        }

        return builder.toString();
    }

    private String formatOptions(String optionsJson) {

        if (optionsJson == null || optionsJson.isBlank()) {
            return "";
        }

        try {

            List<String> options = objectMapper.readValue(
                    optionsJson,
                    new TypeReference<List<String>>() {}
            );

            StringBuilder builder = new StringBuilder();

            char option = 'A';

            for (String value : options) {

                builder.append(option++)
                        .append(". ")
                        .append(value)
                        .append("\n");
            }

            return builder.toString();

        } catch (Exception ex) {
            log.warn("Failed to format MCQ options for prompt.", ex);
            return optionsJson;
        }
    }

}