package com.project.skillforgebackend.quiz.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.project.skillforgebackend.quiz.dto.QuestionDto;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Component

public class QuizMapper {


    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Convert Quiz Entity to QuizDto.
     */
    public QuizDto toDto(Quiz quiz) {

        if (quiz == null) {
            return null;
        }

        return QuizDto.builder()
                .id(quiz.getId().toString())
                .topicName(
                        quiz.getTopic() != null
                                ? quiz.getTopic().getName()
                                : null
                )

                .learningPathTitle(
                        quiz.getLearningPath() != null
                                ? quiz.getLearningPath().getTitle()
                                : null
                )
                .source(quiz.getSource())

                .learningPathId(
                        quiz.getLearningPath() != null
                                ? quiz.getLearningPath().getId().toString()
                                : null
                )

                .weekNumber(
                        quiz.getWeekNumber()
                )
                .difficulty(quiz.getDifficulty())
                .status(quiz.getStatus())
                .totalQuestions(quiz.getTotalQuestions())
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .startedAt(quiz.getStartedAt())
                .expiresAt(quiz.getExpiresAt())
                .completedAt(quiz.getCompletedAt())
                .questions(toQuestionDtoList(quiz.getQuestions()))
                .build();
    }

    /**
     * Convert Question Entity to QuestionDto.
     */
    public QuestionDto toQuestionDto(Question question) {

        if (question == null) {
            return null;
        }

        return QuestionDto.builder()
                .id(question.getId().toString())
                .type(question.getType())
                .content(question.getContent())
                .options(parseOptions(question.getOptionsJson()))
                .orderIndex(question.getOrderIndex())
                .build();
    }

    /**
     * Convert List<Question> to List<QuestionDto>.
     */
    public List<QuestionDto> toQuestionDtoList(List<Question> questions) {

        if (questions == null || questions.isEmpty()) {
            return Collections.emptyList();
        }

        return questions.stream()
                .sorted(Comparator.comparingInt(Question::getOrderIndex))
                .map(this::toQuestionDto)
                .toList();
    }



    private List<String> parseOptions(String optionsJson) {

        if (optionsJson == null || optionsJson.isBlank()) {
            return Collections.emptyList();
        }

        try {

            return objectMapper.readValue(
                    optionsJson,
                    new TypeReference<List<String>>() {}
            );

        } catch (Exception ex) {

            return Collections.emptyList();

        }
    }
}