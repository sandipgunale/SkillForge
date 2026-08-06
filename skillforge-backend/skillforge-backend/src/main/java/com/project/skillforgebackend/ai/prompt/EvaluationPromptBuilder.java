package com.project.skillforgebackend.ai.prompt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Map;

@Component
@Slf4j
public class EvaluationPromptBuilder {

    private final ObjectMapper objectMapper;

    private final PromptTemplateLoader templateLoader;

    public EvaluationPromptBuilder(
            ObjectMapper objectMapper,
            PromptTemplateLoader templateLoader
    ) {
        this.objectMapper = objectMapper;
        this.templateLoader = templateLoader;
    }

    /**
     * Renders the evaluation prompt from the versioned template. The static
     * instructions live in {@code classpath:ai/prompts/evaluation.txt}; the
     * per-quiz question section is dynamic and assembled by
     * {@link #buildQuestions(Quiz)} into the {@code {{QUESTIONS_SECTION}}}
     * placeholder.
     */
    public String build(Quiz quiz) {

        String topicLabel = quiz.getSource() == QuizSource.TOPIC
                ? quiz.getTopic().getName()
                : quiz.getLearningPath().getTitle();

        return templateLoader.render(
                "ai/prompts/evaluation.txt",
                Map.of(
                        "QUIZ_TOPIC", topicLabel,
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