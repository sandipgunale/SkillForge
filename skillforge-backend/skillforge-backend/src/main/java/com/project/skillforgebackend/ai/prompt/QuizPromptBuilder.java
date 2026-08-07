package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Builds quiz-generation prompts from the versioned template
 * {@code ai/prompts/quiz-single.txt} (single-topic) and
 * {@code ai/prompts/quiz-multi.txt} (learning-path summary), keeping the
 * prompt text out of Java source so it can be reviewed, versioned and
 * tuned without a code change.
 */
@Component
@RequiredArgsConstructor
public class QuizPromptBuilder {

    private static final String SINGLE_TOPIC_TEMPLATE = "ai/prompts/quiz-single.txt";
    private static final String MULTI_TOPIC_TEMPLATE = "ai/prompts/quiz-multi.txt";

    private final PromptTemplateLoader templateLoader;

    public String build(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ) {

        String questionTypes = (types == null || types.isEmpty())
                ? "MCQ"
                : types.stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));

        return templateLoader.render(
                SINGLE_TOPIC_TEMPLATE,
                Map.of(
                        "TOPIC", topic,
                        "DIFFICULTY", difficulty.name(),
                        "COUNT", String.valueOf(count),
                        "QUESTION_TYPES", questionTypes
                )
        );
    }

    public String build(
            List<String> topics,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ) {

        String questionTypes = (types == null || types.isEmpty())
                ? "MCQ"
                : types.stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));

        String topicList = topics.stream()
                .map(topic -> "- " + topic)
                .collect(Collectors.joining("\n"));

        return templateLoader.render(
                MULTI_TOPIC_TEMPLATE,
                Map.of(
                        "TOPIC_LIST", topicList,
                        "DIFFICULTY", difficulty.name(),
                        "COUNT", String.valueOf(count),
                        "QUESTION_TYPES", questionTypes
                )
        );
    }
}