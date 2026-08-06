package com.project.skillforgebackend.ai.validation;

import com.project.skillforgebackend.ai.dto.AIEvaluationResponse;
import com.project.skillforgebackend.ai.dto.EvaluationItem;
import com.project.skillforgebackend.ai.dto.QuestionResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Structural validation of AI responses that the Jackson parsers cannot
 * express: cross-field integrity checks such as duplicate {@code orderIndex}
 * values or evaluations that skip or double-cover questions. A violation
 * fails the call with a {@link AIServiceException}, which the parse-retry
 * loop in the service layer turns into a bounded re-generation instead of
 * silently accepting a degraded payload.
 */
@Component
public class AiResponseValidator {

    /**
     * Validates the question list of an AI quiz response.
     */
    public void validateQuizQuestions(List<QuestionResponse> questions) {

        if (questions == null || questions.isEmpty()) {
            return;
        }

        Set<Integer> orderIndexes = new HashSet<>();

        for (QuestionResponse question : questions) {

            if (question.getOrderIndex() == null) {
                continue;
            }

            if (!orderIndexes.add(question.getOrderIndex())) {

                throw new AIServiceException(
                        "AI generated duplicate orderIndex: "
                                + question.getOrderIndex() + "."
                );
            }
        }
    }

    /**
     * Validates that an AI evaluation covers every quiz question exactly
     * once with a usable verdict. The quiz's own id is authoritative —
     * evaluations of unknown questions and omissions are both rejected.
     */
    public void validateEvaluationCoverage(AIEvaluationResponse response, Quiz quiz) {

        if (response == null) {
            throw new AIServiceException(
                    "AI returned an empty evaluation."
            );
        }

        List<EvaluationItem> evaluations = response.getEvaluations();

        if (evaluations == null || evaluations.isEmpty()) {

            throw new AIServiceException(
                    "AI returned no per-question evaluations."
            );
        }

        Set<UUID> quizQuestionIds = quiz.getQuestions()
                .stream()
                .map(Question::getId)
                .collect(java.util.stream.Collectors.toSet());

        Set<UUID> evaluatedIds = new HashSet<>();

        for (EvaluationItem item : evaluations) {

            if (item.getQuestionId() == null
                    || !quizQuestionIds.contains(item.getQuestionId())) {

                throw new AIServiceException(
                        "AI evaluation references an unknown question id."
                );
            }

            if (!evaluatedIds.add(item.getQuestionId())) {

                throw new AIServiceException(
                        "AI evaluated question " + item.getQuestionId()
                                + " more than once."
                );
            }

            if (item.getIsCorrect() == null) {

                throw new AIServiceException(
                        "AI evaluation is missing the verdict for question "
                                + item.getQuestionId() + "."
                );
            }

            if (item.getFeedback() == null || item.getFeedback().isBlank()) {

                throw new AIServiceException(
                        "AI evaluation is missing feedback for question "
                                + item.getQuestionId() + "."
                );
            }
        }

        if (!evaluatedIds.containsAll(quizQuestionIds)) {

            throw new AIServiceException(
                    "AI did not evaluate every question in the quiz."
            );
        }
    }
}