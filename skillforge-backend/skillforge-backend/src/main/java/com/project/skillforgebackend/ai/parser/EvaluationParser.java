package com.project.skillforgebackend.ai.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.ai.dto.AIEvaluationResponse;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.ai.validation.AiResponseValidator;
import com.project.skillforgebackend.quiz.dto.QuestionResultDto;
import com.project.skillforgebackend.quiz.dto.QuizAnalyticsDto;
import com.project.skillforgebackend.quiz.dto.QuizInsightDto;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.QuizSummaryDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EvaluationParser {

    private final ObjectMapper objectMapper;

    private final AiResponseValidator responseValidator;

    public QuizResultDto parse(
            String json,
            Quiz quiz
    ) {

        try {

            AIEvaluationResponse response =
                    objectMapper.readValue(
                            ParserUtils.cleanJson(json),
                            AIEvaluationResponse.class
                    );

            if (response == null) {
                throw new AIServiceException(
                        "Invalid AI evaluation response."
                );
            }

            responseValidator.validateEvaluationCoverage(response, quiz);

            applyEvaluation(response, quiz);

            int score = calculateScore(quiz);

            quiz.setScore(score);

            double percentage = calculatePercentage(
                    score,
                    quiz.getMaxScore()
            );

            return buildResult(
                    quiz,
                    response,
                    score,
                    percentage
            );

        } catch (AIServiceException ex) {

            throw ex;

        } catch (Exception ex) {

            throw new AIServiceException(
                    "Failed to parse AI evaluation.",
                    ex
            );
        }

    }

    /**
     * Applies AI evaluation to Quiz entities.
     */
    private void applyEvaluation(
            AIEvaluationResponse response,
            Quiz quiz
    ) {

        if (response.getEvaluations() == null) {
            return;
        }

        response.getEvaluations().forEach(evaluation ->

                quiz.getQuestions()
                        .stream()
                        .filter(question ->
                                question.getId()
                                        .equals(evaluation.getQuestionId())
                        )
                        .findFirst()
                        .ifPresent(question -> {

                            question.setIsCorrect(
                                    evaluation.getIsCorrect()
                            );

                            question.setAiFeedback(
                                    evaluation.getFeedback()
                            );

                        })
        );

    }

    /**
     * Calculates quiz score.
     */
    private int calculateScore(
            Quiz quiz
    ) {

        return (int) quiz.getQuestions()
                .stream()
                .filter(question ->
                        Boolean.TRUE.equals(question.getIsCorrect()))
                .count();

    }

    /**
     * Calculates percentage.
     */
    private double calculatePercentage(
            int score,
            int maxScore
    ) {

        if (maxScore == 0) {
            return 0;
        }

        return Math.round(
                ((double) score / maxScore) * 10000
        ) / 100.0;

    }

    /**
     * Builds Question Result list.
     */
    private List<QuestionResultDto> buildQuestionResults(
            Quiz quiz
    ) {

        return quiz.getQuestions()
                .stream()
                .map(question ->

                        QuestionResultDto.builder()

                                .questionId(
                                        question.getId().toString()
                                )

                                .questionType(
                                        question.getType()
                                )

                                .content(
                                        question.getContent()
                                )

                                .correctAnswer(
                                        question.getCorrectAnswer()
                                )

                                .userAnswer(
                                        question.getUserAnswer()
                                )

                                .correct(
                                        Boolean.TRUE.equals(
                                                question.getIsCorrect()
                                        )
                                )

                                .aiFeedback(
                                        question.getAiFeedback()
                                )

                                .build()

                )
                .toList();

    }

    /**
     * Builds final QuizResultDto.
     */
    private QuizResultDto buildResult(
            Quiz quiz,
            AIEvaluationResponse response,
            int score,
            double percentage
    ) {

        return QuizResultDto.builder()

                .quizId(
                        quiz.getId().toString()
                )

                .summary(

                        QuizSummaryDto.builder()

                                .score(score)

                                .maxScore(
                                        quiz.getMaxScore()
                                )

                                .percentage(percentage)

                                .grade(null)

                                .durationInSeconds(null)

                                .build()

                )

                .analytics(

                        QuizAnalyticsDto.builder()

                                .totalQuestions(
                                        quiz.getTotalQuestions()
                                )

                                .answeredQuestions(
                                        (int) quiz.getQuestions()
                                                .stream()
                                                .filter(question ->
                                                        question.getUserAnswer() != null
                                                                && !question.getUserAnswer().isBlank()
                                                )
                                                .count()
                                )

                                .correctAnswers(score)

                                .incorrectAnswers(
                                        quiz.getTotalQuestions() - score
                                )

                                .accuracy(
                                        percentage
                                )

                                .build()

                )

                .insight(

                        QuizInsightDto.builder()

                                .overallFeedback(
                                        response.getOverallFeedback()
                                )

                                .strengths(
                                        response.getStrengths()
                                )

                                .weaknesses(
                                        response.getWeaknesses()
                                )

                                .improvements(
                                        response.getImprovements()
                                )

                                .build()

                )

                .questions(
                        buildQuestionResults(quiz)
                )

                .build();

    }

}