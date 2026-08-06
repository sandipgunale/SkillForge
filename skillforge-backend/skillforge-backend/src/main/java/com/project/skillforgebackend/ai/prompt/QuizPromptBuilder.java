package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.resource.entity.Resource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Builds quiz-generation prompts. The prompt text lives in versioned
 * resources under {@code classpath:ai/prompts/quiz-*.txt} (loaded and
 * rendered by {@link PromptTemplateLoader}); this class fills in the
 * dynamic inputs (topic(s), difficulty, count, question types).
 */
@Component
public class QuizPromptBuilder {

    private final PromptTemplateLoader templateLoader;

    public QuizPromptBuilder(PromptTemplateLoader templateLoader) {
        this.templateLoader = templateLoader;
    }

    public String build(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> types
    ) {

        String questionTypes = formatQuestionTypes(types);

        return templateLoader.render(
                "ai/prompts/quiz-single.txt",
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

        String questionTypes = formatQuestionTypes(types);

        String topicList = topics.stream()
                .map(topic -> "- " + topic)
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");

        return templateLoader.render(
                "ai/prompts/quiz-multi.txt",
                Map.of(
                        "COUNT", String.valueOf(count),
                        "TOPIC_LIST", topicList,
                        "DIFFICULTY", difficulty.name(),
                        "QUESTION_TYPES", questionTypes
                )
        );
    }

    private String formatQuestionTypes(List<Question.QuestionType> types) {

        if (types == null || types.isEmpty()) {
            return "MCQ";
        }

        return types.stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }
}