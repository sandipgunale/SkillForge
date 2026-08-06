package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.dto.LastQuizDto;
import com.project.skillforgebackend.analytics.dto.QuizScoreDto;
import com.project.skillforgebackend.analytics.util.AnalyticsUtils;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Quiz-derived analytics of the dashboard: recent score history and the
 * most recent completed quiz.
 */
@Component
public class QuizAnalyticsBuilder {

    public QuizAnalyticsParts build(List<Quiz> recentQuizzes) {

        List<QuizScoreDto> recentQuizScores =
                recentQuizzes.stream()
                        .map(this::toQuizScore)
                        .toList();

        LastQuizDto lastQuiz = recentQuizzes.stream()
                .findFirst()
                .map(this::toLastQuiz)
                .orElse(null);

        return new QuizAnalyticsParts(recentQuizScores, lastQuiz);
    }

    private QuizScoreDto toQuizScore(Quiz quiz) {

        BigDecimal percentage =
                AnalyticsUtils.calculatePercentage(
                        quiz.getScore(),
                        quiz.getMaxScore()
                );

        return QuizScoreDto.builder()
                .quizId(quiz.getId().toString())
                .topicName(quizTitle(quiz))
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .percentage(percentage)
                .completedAt(quiz.getCompletedAt())
                .build();
    }

    private LastQuizDto toLastQuiz(Quiz quiz) {

        BigDecimal percentage =
                AnalyticsUtils.calculatePercentage(
                        quiz.getScore(),
                        quiz.getMaxScore()
                );

        return LastQuizDto.builder()
                .quizId(quiz.getId().toString())
                .topicName(quizTitle(quiz))
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .percentage(percentage)
                .completedAt(quiz.getCompletedAt())
                .build();
    }

    private String quizTitle(Quiz quiz) {

        if (quiz.getSource() == QuizSource.TOPIC) {
            return quiz.getTopic().getName();
        }

        return quiz.getLearningPath().getTitle()
                + " - Week "
                + quiz.getWeekNumber();
    }

    public record QuizAnalyticsParts(
            List<QuizScoreDto> recentQuizScores,
            LastQuizDto lastQuiz
    ) {
    }
}
