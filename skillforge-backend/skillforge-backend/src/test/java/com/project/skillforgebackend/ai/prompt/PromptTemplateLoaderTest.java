package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PromptTemplateLoaderTest {

    private PromptTemplateLoader loader;

    @BeforeEach
    void setUp() {
        loader = new PromptTemplateLoader(new DefaultResourceLoader());
    }

    @Test
    void rendersAllTokens() {
        String rendered = loader.render(
                "prompt-templates/sample.txt",
                Map.of("INTRO", "Hello", "BODY", "World")
        );

        assertThat(rendered)
                .isEqualTo("Introduction:\nHello - Hello\n\nBody:\nWorld");
    }

    @Test
    void rendersTokenAppearingMultipleTimes() {
        String rendered = loader.render(
                "prompt-templates/sample.txt",
                Map.of("INTRO", "x", "BODY", "y")
        );

        assertThat(rendered)
                .isEqualTo("Introduction:\nx - x\n\nBody:\ny");
    }

    @Test
    void undefinedTokenFailsFast() {
        assertThatThrownBy(() -> loader.render(
                "prompt-templates/sample.txt",
                Map.of("INTRO", "Hello")
        ))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("undefined token {{BODY}}");
    }

    @Test
    void missingTemplateFails() {
        assertThatThrownBy(() -> loader.render(
                "prompt-templates/does-not-exist.txt",
                Map.of("INTRO", "Hello", "BODY", "World")
        ))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("Prompt template not found");
    }

    @Test
    void templatesAreCached() {
        String first = loader.render(
                "prompt-templates/sample.txt",
                Map.of("INTRO", "A", "BODY", "B")
        );

        loader.clearCache();

        String second = loader.render(
                "prompt-templates/sample.txt",
                Map.of("INTRO", "A", "BODY", "B")
        );

        assertThat(second).isEqualTo(first);
    }
}
