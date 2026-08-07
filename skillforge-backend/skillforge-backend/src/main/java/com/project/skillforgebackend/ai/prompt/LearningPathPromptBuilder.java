package com.project.skillforgebackend.ai.prompt;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Builds learning-roadmap prompts from the versioned template
 * {@code ai/prompts/learning-path.txt}, keeping the prompt text out of
 * Java source so it can be reviewed, versioned and tuned without a
 * code change.
 */
@Component
@RequiredArgsConstructor
public class LearningPathPromptBuilder {

    private static final String TEMPLATE = "ai/prompts/learning-path.txt";

    private final PromptTemplateLoader templateLoader;

    public String build(
            String title,
            String goal,
            String skillLevel,
            Integer weeklyHours,
            Integer durationWeeks
    ) {

        return templateLoader.render(
                TEMPLATE,
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