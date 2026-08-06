package com.project.skillforgebackend.ai.validation;

import com.project.skillforgebackend.ai.dto.AIEvaluationResponse;
import com.project.skillforgebackend.ai.dto.EvaluationItem;
import com.project.skillforgebackend.ai.dto.QuestionResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AiResponseValidatorTest {

    private final AiResponseValidator validator = new AiResponseValidator();

    @Test
    void acceptsUniqueOrderIndexes() {
        assertDoesNotThrow(() ->
                validator.validateQuizQuestions(List.of(q(1), q(2), q(3))));
    }

    @Test
    void rejectsDuplicateOrderIndex() {
        assertThrows(AIServiceException.class, () ->
                validator.validateQuizQuestions(List.of(q(1), q(1))));
    }

    @Test
    void toleratesEmptyOrNullQuestionList() {
        assertDoesNotThrow(() -> validator.validateQuizQuestions(List.of()));
        assertDoesNotThrow(() -> validator.validateQuizQuestions(null));
    }

    private static QuestionResponse q(int orderIndex) {
        return QuestionResponse.builder().orderIndex(orderIndex).build();
    }

    private Quiz quizWith(UUID... ids) {
        List<Question> questions = java.util.Arrays.stream(ids)
                .map(id -> Question.builder().id(id).build())
                .toList();
        return Quiz.builder().questions(questions).build();
    }

    private UUID firstQuestion(int salt) {
        return UUID.fromString(String.format(
                "00000000-0000-4000-8000-%012d", salt));
    }

    private static EvaluationItem good(UUID questionId) {
        return EvaluationItem.builder()
                .questionId(questionId)
                .isCorrect(true)
                .feedback("ok")
                .build();
    }

    @Test
    void acceptsCompleteEvaluation() {
        UUID id = firstQuestion(1);
        AIEvaluationResponse response = new AIEvaluationResponse(
                "good", List.of("s"), List.of("w"), List.of("i"),
                List.of(good(id)));

        assertDoesNotThrow(() -> validator.validateEvaluationCoverage(response, quizWith(id)));
    }

    @Test
    void rejectsNullEvaluation() {
        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(null, quizWith(firstQuestion(1))));
    }

    @Test
    void rejectsEmptyEvaluationList() {
        UUID id = firstQuestion(1);
        AIEvaluationResponse response = new AIEvaluationResponse(
                "g", null, null, null, List.of());

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(response, quizWith(id)));
    }

    @Test
    void rejectsUnknownQuestionId() {
        UUID known = firstQuestion(1);
        AIEvaluationResponse response = new AIEvaluationResponse(
                "g", null, null, null, List.of(good(firstQuestion(2))));

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(response, quizWith(known)));
    }

    @Test
    void rejectsDuplicateEvaluationOfSameQuestion() {
        UUID id = firstQuestion(1);
        AIEvaluationResponse response = new AIEvaluationResponse(
                "g", null, null, null,
                List.of(good(id), good(id)));

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(response, quizWith(id)));
    }

    @Test
    void rejectsMissingVerdictAndFeedback() {
        UUID id = firstQuestion(1);
        AIEvaluationResponse missingVerdict = new AIEvaluationResponse(
                "g", null, null, null,
                List.of(EvaluationItem.builder().questionId(id).feedback("x").build()));

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(missingVerdict, quizWith(id)));

        AIEvaluationResponse missingFeedback = new AIEvaluationResponse(
                "g", null, null, null,
                List.of(EvaluationItem.builder().questionId(id).isCorrect(true).build()));

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(missingFeedback, quizWith(id)));
    }

    @Test
    void rejectsPartialCoverage() {
        UUID a = firstQuestion(1);
        UUID b = firstQuestion(2);
        AIEvaluationResponse response = new AIEvaluationResponse(
                "g", null, null, null, List.of(good(a)));

        assertThrows(AIServiceException.class, () ->
                validator.validateEvaluationCoverage(response, quizWith(a, b)));
    }
}