package com.project.skillforgebackend.quiz.service;

import com.project.skillforgebackend.quiz.dto.QuestionResultDto;
import com.project.skillforgebackend.quiz.dto.QuizAnalyticsDto;
import com.project.skillforgebackend.quiz.dto.QuizInsightDto;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.dto.QuizSummaryDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Deterministic fallback grader used when Gemini is unreachable.
 *
 * <p>Grades every question by comparing the stored user answer with the
 * stored correct answer, writes per-question feedback from templates, and
 * builds the same {@link QuizResultDto} shape the AI path produces so the
 * rest of the submission pipeline is identical. The result is flagged with
 * {@code aiEvaluated = false} so clients can surface that AI feedback is
 * not available for this run.</p>
 */
@Component
@Slf4j
public class QuizResultBuilder {

    public QuizResultDto build(Quiz quiz, boolean aiEvaluated) {

        List<QuestionResultDto> questionResults =
                quiz.getQuestions().stream()
                        .map(this::gradeQuestion)
                        .toList();

        int score = (int) questionResults.stream()
                .filter(QuestionResultDto::isCorrect)
                .count();

        int maxScore = quiz.getMaxScore();

        double percentage = calculatePercentage(score, maxScore);

        return QuizResultDto.builder()
                .quizId(quiz.getId().toString())
                .summary(QuizSummaryDto.builder()
                        .score(score)
                        .maxScore(maxScore)
                        .percentage(percentage)
                        .grade(null)
                        .durationInSeconds(null)
                        .build())
                .analytics(QuizAnalyticsDto.builder()
                        .totalQuestions(quiz.getTotalQuestions())
                        .answeredQuestions((int) quiz.getQuestions().stream()
                                .filter(q -> q.getUserAnswer() != null
                                        && !q.getUserAnswer().isBlank())
                                .count())
                        .correctAnswers(score)
                        .incorrectAnswers(quiz.getTotalQuestions() - score)
                        .accuracy(percentage)
                        .build())
                .insight(buildInsight(percentage, score, maxScore))
                .questions(questionResults)
                .aiEvaluated(aiEvaluated)
                .build();
    }

    /**
     * Uses the persisted verdict when one exists (completed quizzes),
     * otherwise compares the user answer with the stored correct answer.
     */
    private QuestionResultDto gradeQuestion(Question question) {

        boolean correct = question.getIsCorrect() != null
                ? question.getIsCorrect()
                : isAnswerCorrect(question);

        String feedback = question.getAiFeedback() != null
                ? question.getAiFeedback()
                : templateFeedback(correct, question);

        question.setIsCorrect(correct);
        question.setAiFeedback(feedback);

        return QuestionResultDto.builder()
                .questionId(question.getId().toString())
                .questionType(question.getType())
                .content(question.getContent())
                .correctAnswer(question.getCorrectAnswer())
                .userAnswer(question.getUserAnswer())
                .correct(correct)
                .aiFeedback(feedback)
                .build();
    }

    private boolean isAnswerCorrect(Question question) {

        String userAnswer = question.getUserAnswer();
        String correctAnswer = question.getCorrectAnswer();

        if (userAnswer == null || correctAnswer == null) {
            return false;
        }

        return userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    private String templateFeedback(boolean correct, Question question) {

        if (correct) {
            return "Correct. Your answer matches the expected response.";
        }

        String correctAnswer = question.getCorrectAnswer() == null
                ? "not available"
                : question.getCorrectAnswer();

        return "Incorrect. The expected answer is: " + correctAnswer
                + ". Review this topic before your next attempt.";
    }

    private QuizInsightDto buildInsight(
            double percentage,
            int score,
            int maxScore
    ) {

        if (percentage >= 90) {
            return insight(
                    "Excellent result. You have a strong command of this topic.",
                    List.of("Accurate recall on most questions"),
                    List.of("A few edge cases remain"),
                    List.of("Attempt harder difficulty quizzes to stretch further")
            );
        }

        if (percentage >= 70) {
            return insight(
                    "Good progress. You know the core material well.",
                    List.of("Solid grasp of the fundamentals"),
                    List.of("Some questions were missed"),
                    List.of("Review the questions you answered incorrectly")
            );
        }

        if (percentage >= 50) {
            return insight(
                    "You are building momentum. Consistent review will move you into mastery.",
                    List.of("You answered "
                            + score + " of " + maxScore + " questions correctly"),
                    List.of("Several concepts need reinforcement"),
                    List.of("Re-quiz this topic after reviewing the material")
            );
        }

        return insight(
                "This result is a baseline. Use it as a starting point for focused review.",
                List.of("The attempt itself is progress"),
                List.of("Most of this topic needs review"),
                List.of("Review the material, then generate a fresh quiz to measure improvement")
        );
    }

    private QuizInsightDto insight(
            String overall,
            List<String> strengths,
            List<String> weaknesses,
            List<String> improvements
    ) {
        return QuizInsightDto.builder()
                .overallFeedback(overall)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .improvements(improvements)
                .build();
    }

    private double calculatePercentage(int score, int maxScore) {

        if (maxScore == 0) {
            return 0;
        }

        return Math.round(
                ((double) score / maxScore) * 10000
        ) / 100.0;
    }
}
