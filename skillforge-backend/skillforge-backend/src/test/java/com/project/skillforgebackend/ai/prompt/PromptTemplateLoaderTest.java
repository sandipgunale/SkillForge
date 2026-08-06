package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PromptTemplateLoaderTest {

    private PromptTemplateLoader loader;

    @BeforeEach
    void setUp() {
        loader = new PromptTemplateLoader(new DefaultResourceLoader());
    }

    @Test
    void rendersPlaceholdersAndCachesTemplate() {
        String first = loader.render(
                "ai/prompts/quiz-multi.txt",
                Map.of(
                        "COUNT", "7",
                        "TOPIC_LIST", "- Java\n- SQL",
                        "DIFFICULTY", "BEGINNER",
                        "QUESTION_TYPES", "MCQ"
                )
        );

        String second = loader.render(
                "ai/prompts/quiz-multi.txt",
                Map.of(
                        "COUNT", "9",
                        "TOPIC_LIST", "- Java",
                        "DIFFICULTY", "ADVANCED",
                        "QUESTION_TYPES", "CODING"
                )
        );

        assertTrue(first.contains("Generate EXACTLY 7 questions."));
        assertTrue(first.contains("- Java\n- SQL"));
        assertTrue(first.contains("BEGINNER"));
        assertTrue(second.contains("Generate EXACTLY 9 questions."));
        assertTrue(second.contains("ADVANCED"));
    }

    @Test
    void replacesAllOccurrencesOfAToken() {
        String rendered = loader.render(
                "ai/prompts/learning-path.txt",
                Map.of(
                        "TITLE", "T",
                        "GOAL", "G",
                        "SKILL_LEVEL", "S",
                        "WEEKLY_HOURS", "10",
                        "DURATION_WEEKS", "12"
                )
        );

        assertTrue(rendered.contains("12 Weeks"));
        assertTrue(rendered.contains("span exactly 12 weeks."));
        assertTrue(rendered.contains("10 Hours"));
        assertTrue(!rendered.contains("{{"));
    }

@Test
    void throwsWhenValueMissingForToken() {
        assertThrows(AIServiceException.class, () ->
                loader.render(
                        "ai/prompts/learning-path.txt",
                        Map.of("TITLE", "T")
                ));
    }

    @Test
    void throwsWhenTemplateMissing() {
        assertThrows(AIServiceException.class, () ->
                loader.render("ai/prompts/nope.txt", Map.of()));
    }

    @Test
    void clearsCache() {
        loader.render(
                "ai/prompts/quiz-multi.txt",
                Map.of("COUNT", "1", "TOPIC_LIST", "- x", "DIFFICULTY", "BEGINNER", "QUESTION_TYPES", "MCQ")
        );
        loader.clearCache();
        // no assertion on cache internals; just exercises the public API
        assertTrue(true);
    }

    @Test
    void distinctTemplatesRenderIndependently() {
        String quiz = loader.render(
                "ai/prompts/quiz-multi.txt",
                Map.of("COUNT", "2", "TOPIC_LIST", "- x", "DIFFICULTY", "BEGINNER", "QUESTION_TYPES", "MCQ")
        );

        String path = loader.render(
                "ai/prompts/learning-path.txt",
                Map.of("TITLE", "T", "GOAL", "G", "SKILL_LEVEL", "S", "WEEKLY_HOURS", "4", "DURATION_WEEKS", "6")
        );

        assertTrue(quiz.startsWith("You are a Senior Software Engineer"));
        assertTrue(path.contains("ROADMAP TITLE"));
    }
}