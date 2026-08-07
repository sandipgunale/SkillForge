package com.project.skillforgebackend.ai.validation;

import com.project.skillforgebackend.ai.dto.AIEvaluationResponse;
import com.project.skillforgebackend.ai.dto.EvaluationItem;
import com.project.skillforgebackend.ai.dto.QuestionResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiResponseValidatorTest {

    private AiResponseValidator validator;

    @BeforeEach
    void setUp() {
        validator = new AiResponseValidator();
    }

    private QuestionResponse validMcq(Integer orderIndex) {
        return QuestionResponse.builder()
                .type(Question.QuestionType.MCQ)
                .content("What is Java? " + orderIndex)
                .options(List.of("A", "B", "C", "D"))
                .correctAnswer("A")
                .orderIndex(orderIndex)
                .build();
    }

    @Test
    void acceptsValidQuestionSet() {
        validator.validateQuizQuestions(List.of(
                validMcq(1),
                validMcq(2),
                QuestionResponse.builder()
                        .type(Question.QuestionType.SCENARIO)
                        .content("Explain recursion")
                        .orderIndex(3)
                        .build()
        ));
    }

    @Test
    void rejectsEmptyQuestions() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(List.of()))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("No questions were generated");
    }

    @Test
    void rejectsNullQuestions() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(null))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("No questions were generated");
    }

    @Test
    void rejectsQuestionWithoutType() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(List.of(
                QuestionResponse.builder()
                        .content("What?")
                        .orderIndex(1)
                        .build()
        )))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("without a type");
    }

    @Test
    void rejectsMcqWithoutFourOptions() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(List.of(
                QuestionResponse.builder()
                        .type(Question.QuestionType.MCQ)
                        .content("Which?")
                        .options(List.of("A", "B"))
                        .orderIndex(1)
                        .build()
        )))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("exactly 4 options");
    }

    @Test
    void rejectsDuplicateOrderIndex() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(List.of(
                validMcq(1),
                validMcq(1)
        )))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("duplicate orderIndex");
    }

    @Test
    void rejectsBlankContent() {
        assertThatThrownBy(() -> validator.validateQuizQuestions(List.of(
                QuestionResponse.builder()
                        .type(Question.QuestionType.MCQ)
                        .content("   ")
                        .options(List.of("A", "B", "C", "D"))
                        .orderIndex(1)
                        .build()
        )))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("empty content");
    }

    @Test
    void rejectsEvaluationsMissingQuestions() {
        UUID id = UUID.randomUUID();

        Quiz quiz = Quiz.builder()
                .questions(List.of(Question.builder().id(id).build()))
                .build();

        AIEvaluationResponse response = AIEvaluationResponse.builder()
                .evaluations(List.of())
                .build();

        assertThatThrownBy(() -> validator.validateEvaluationCoverage(response, quiz))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("missing 1 question evaluation");
    }

    @Test
    void rejectsEvaluationOfUnknownQuestion() {
        Quiz quiz = Quiz.builder()
                .questions(List.of(Question.builder().id(UUID.randomUUID()).build()))
                .build();

        AIEvaluationResponse response = AIEvaluationResponse.builder()
                .evaluations(List.of(EvaluationItem.builder()
                        .questionId(UUID.randomUUID())
                        .isCorrect(true)
                        .feedback("Good")
                        .build()))
                .build();

        assertThatThrownBy(() -> validator.validateEvaluationCoverage(response, quiz))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("unknown question");
    }

    @Test
    void rejectsDuplicateEvaluation() {
        UUID id = UUID.randomUUID();

        Quiz quiz = Quiz.builder()
                .questions(List.of(Question.builder().id(id).build()))
                .build();

        AIEvaluationResponse response = AIEvaluationResponse.builder()
                .evaluations(List.of(
                        EvaluationItem.builder().questionId(id).isCorrect(true).feedback("a").build(),
                        EvaluationItem.builder().questionId(id).isCorrect(false).feedback("b").build()
                ))
                .build();

        assertThatThrownBy(() -> validator.validateEvaluationCoverage(response, quiz))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("evaluated question twice");
    }

    @Test
    void rejectsEvaluationMissingFeedback() {
        UUID id = UUID.randomUUID();

        Quiz quiz = Quiz.builder()
                .questions(List.of(Question.builder().id(id).build()))
                .build();

        AIEvaluationResponse response = AIEvaluationResponse.builder()
                .evaluations(List.of(EvaluationItem.builder()
                        .questionId(id)
                        .isCorrect(true)
                        .build()))
                .build();

        assertThatThrownBy(() -> validator.validateEvaluationCoverage(response, quiz))
                .isInstanceOf(AIServiceException.class)
                .hasMessageContaining("missing feedback");
    }

    @Test
    void acceptsCompleteEvaluation() {
        UUID id = UUID.randomUUID();

        Quiz quiz = Quiz.builder()
                .questions(List.of(Question.builder().id(id).build()))
                .build();

        AIEvaluationResponse response = AIEvaluationResponse.builder()
                .evaluations(List.of(EvaluationItem.builder()
                        .questionId(id)
                        .isCorrect(true)
                        .feedback("Excellent")
                        .build()))
                .build();

        validator.validateEvaluationCoverage(response, quiz);
    }
}