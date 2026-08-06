package com.project.skillforgebackend.aigold;

import com.project.skillforgebackend.ai.prompt.EvaluationPromptBuilder;
import com.project.skillforgebackend.ai.prompt.LearningPathPromptBuilder;
import com.project.skillforgebackend.ai.prompt.PromptTemplateLoader;
import com.project.skillforgebackend.ai.prompt.QuizPromptBuilder;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Pins the template-based prompt builders to the exact prompt text the
 * original inline builders produced (golden files exported from them).
 * Any change to the template resources or the placeholder contract shows
 * up here, so prompt drift is a visible test failure, not a silent
 * behaviour change.
 */
class PromptTemplateFidelityTest {

    private final PromptTemplateLoader loader =
            new PromptTemplateLoader(new DefaultResourceLoader());

    private String golden(String name) throws Exception {
        return new org.springframework.core.io.ClassPathResource(
                "prompt-golden/" + name
        ).getContentAsString(StandardCharsets.UTF_8);
    }

    @Test
    void quizSingleTemplateMatchesGolden() throws Exception {
        String rendered = new QuizPromptBuilder(loader).build(
                "@@TOPIC@@",
                Resource.Difficulty.BEGINNER,
                12345,
                List.of(Question.QuestionType.MCQ, Question.QuestionType.CODING)
        );
        assertEquals(golden("quiz-single.txt"), rendered);
    }

    @Test
    void quizMultiTemplateMatchesGolden() throws Exception {
        String rendered = new QuizPromptBuilder(loader).build(
                List.of("@@T1@@", "@@T2@@"),
                Resource.Difficulty.INTERMEDIATE,
                23456,
                List.of(Question.QuestionType.MCQ)
        );
        assertEquals(golden("quiz-multi.txt"), rendered);
    }

    @Test
    void learningPathTemplateMatchesGolden() throws Exception {
        String rendered = new LearningPathPromptBuilder(loader).build(
                "@@TITLE@@",
                "@@GOAL@@",
                "@@SKILL@@",
                34567,
                45678
        );
        assertEquals(golden("learning-path.txt"), rendered);
    }

    @Test
    void evaluationTemplateMatchesGolden() throws Exception {
        Quiz quiz = Quiz.builder()
                .source(QuizSource.TOPIC)
                .topic(Topic.builder()
                        .name("@@TOPIC@@")
                        .slug("@@topic@@")
                        .description("golden export")
                        .icon("code")
                        .displayOrder(1)
                        .build())
                .difficulty(Resource.Difficulty.ADVANCED)
                .questions(List.of(Question.builder()
                        .id(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                        .type(Question.QuestionType.MCQ)
                        .content("@@CONTENT@@")
                        .optionsJson("[\"A\",\"B\",\"C\",\"D\"]")
                        .correctAnswer("@@ANSWER@@")
                        .userAnswer("@@USERANSWER@@")
                        .orderIndex(1)
                        .build()))
                .build();

        String rendered = new EvaluationPromptBuilder(
                new com.fasterxml.jackson.databind.ObjectMapper(),
                loader
        ).build(quiz);

        assertEquals(golden("evaluation.txt"), rendered);
    }
}
