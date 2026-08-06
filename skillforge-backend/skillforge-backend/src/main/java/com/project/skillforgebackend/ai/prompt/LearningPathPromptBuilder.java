package com.project.skillforgebackend.ai.prompt;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Builds learning-path roadmap prompts. The prompt text lives in the
 * versioned resource {@code classpath:ai/prompts/learning-path.txt} and is
 * rendered by {@link PromptTemplateLoader}; this class fills in the learner
 * profile inputs.
 */
@Component
public class LearningPathPromptBuilder {

    private final PromptTemplateLoader templateLoader;

    public LearningPathPromptBuilder(PromptTemplateLoader templateLoader) {
        this.templateLoader = templateLoader;
    }

    public String build(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {

        return templateLoader.render(
                "ai/prompts/learning-path.txt",
                Map.of(
                        "TITLE", title,
                        "GOAL", goal,
                        "SKILL_LEVEL", skillLevel,
                        "WEEKLY_HOURS", String.valueOf(weeklyHours),
                        "DURATION_WEEKS", String.valueOf(durationWeeks)
                )
        );
    }
}