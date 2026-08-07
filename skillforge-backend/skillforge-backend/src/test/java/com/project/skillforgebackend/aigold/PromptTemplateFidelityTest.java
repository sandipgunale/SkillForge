package com.project.skillforgebackend.aigold;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.ai.prompt.EvaluationPromptBuilder;
import com.project.skillforgebackend.ai.prompt.LearningPathPromptBuilder;
import com.project.skillforgebackend.ai.prompt.PromptTemplateLoader;
import com.project.skillforgebackend.ai.prompt.QuizPromptBuilder;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Locks the template-based prompt builders to the golden prompt text that
 * the original inline builders produced. Any edit to the prompt templates
 * or builders that changes generated output fails here, protecting the
 * tuned prompt contract.
 */
class PromptTemplateFidelityTest {

    private static final Path GOLDEN =
            Path.of("src", "test", "resources", "prompt-golden");

    private QuizPromptBuilder quizPromptBuilder;

    private LearningPathPromptBuilder learningPathPromptBuilder;

    private EvaluationPromptBuilder evaluationPromptBuilder;

    @BeforeEach
    void setUp() {
        PromptTemplateLoader loader = new PromptTemplateLoader(new DefaultResourceLoader());
        quizPromptBuilder = new QuizPromptBuilder(loader);
        learningPathPromptBuilder = new LearningPathPromptBuilder(loader);
        evaluationPromptBuilder = new EvaluationPromptBuilder(new ObjectMapper(), loader);
    }

    @Test
    void quizSingleMatchesGolden() throws Exception {
        String prompt = quizPromptBuilder.build(
                "@@TOPIC@@",
                Resource.Difficulty.BEGINNER,
                12345,
                List.of(Question.QuestionType.MCQ, Question.QuestionType.CODING)
        );
        assertEquals(golden("quiz-single.txt"), prompt);
    }

    @Test
    void quizMultiMatchesGolden() throws Exception {
        String prompt = quizPromptBuilder.build(
                List.of("@@T1@@", "@@T2@@"),
                Resource.Difficulty.INTERMEDIATE,
                23456,
                List.of(Question.QuestionType.MCQ)
        );
        assertEquals(golden("quiz-multi.txt"), prompt);
    }

    @Test
    void learningPathMatchesGolden() throws Exception {
        String prompt = learningPathPromptBuilder.build(
                "@@TITLE@@",
                "@@GOAL@@",
                "@@SKILL@@",
                34567,
                45678
        );
        assertEquals(golden("learning-path.txt"), prompt);
    }

    @Test
    void evaluationMatchesGolden() throws Exception {
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

        String prompt = evaluationPromptBuilder.build(quiz);
        assertEquals(golden("evaluation.txt"), prompt);
    }

    private String golden(String name) throws Exception {
        return Files.readString(GOLDEN.resolve(name));
    }
}
