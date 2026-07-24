package com.project.skillforgebackend.ai.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.ai.dto.QuestionResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.entity.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AIQuestionMapper {

    private final ObjectMapper objectMapper;

    /**
     * Converts AI QuestionResponse into Question Entity.
     */
    public Question toEntity(QuestionResponse dto) {

        try {

            validate(dto);

            String optionsJson = dto.getOptions() == null
                    ? null
                    : objectMapper.writeValueAsString(dto.getOptions());

            return Question.builder()
                    .type(dto.getType())
                    .content(dto.getContent())
                    .optionsJson(optionsJson)
                    .correctAnswer(dto.getCorrectAnswer())
                    .orderIndex(
                            dto.getOrderIndex() == null
                                    ? 0
                                    : dto.getOrderIndex()
                    )
                    .build();

        } catch (AIServiceException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new AIServiceException(
                    "Failed to convert AI question.",
                    ex
            );
        }
    }

    /**
     * Validates AI generated question.
     */
    private void validate(QuestionResponse dto) {

        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new AIServiceException(
                    "AI returned an empty question."
            );
        }

        if (dto.getCorrectAnswer() == null || dto.getCorrectAnswer().isBlank()) {
            throw new AIServiceException(
                    "AI returned an invalid correct answer."
            );
        }

        if (dto.getType() == Question.QuestionType.MCQ) {

            if (dto.getOptions() == null || dto.getOptions().size() != 4) {
                throw new AIServiceException(
                        "MCQ must contain exactly 4 options."
                );
            }

            if (!dto.getOptions().contains(dto.getCorrectAnswer())) {
                throw new AIServiceException(
                        "Correct answer is not present in options."
                );
            }
        }
    }

}