package com.project.skillforgebackend.analytics.service;

import com.project.skillforgebackend.analytics.dto.DashboardDto;
import com.project.skillforgebackend.analytics.dto.QuizScoreDto;
import com.project.skillforgebackend.analytics.dto.TopicAnalyticsDto;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.progress.repository.ProgressRepository;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ProgressRepository progressRepository;
    private final QuizRepository quizRepository;

    public DashboardDto getDashboard(User user) {

        List<Progress> progressList =
                progressRepository.findByUserOrderByLastActivityAtDesc(user);

        List<Quiz> recentQuizzes =
                quizRepository.findTop10ByUserAndStatusOrderByCompletedAtDesc(
                        user,
                        Quiz.QuizStatus.COMPLETED
                );



        // Total learning time
        int totalLearningMinutes = progressList.stream()
                .mapToInt(Progress::getMinutesSpent)
                .sum();

        // Total topics started
        int totalTopicsStarted = progressList.size();

        // Total quizzes taken
        // Total completed quizzes
        int totalQuizzesTaken = (int) quizRepository.countByUserAndStatus(
                user,
                Quiz.QuizStatus.COMPLETED
        );
        // Overall average score
        BigDecimal overallAverageScore;

        if (recentQuizzes.isEmpty()) {

            overallAverageScore = BigDecimal.ZERO;

        } else {

            double average = recentQuizzes.stream()
                    .filter(quiz -> quiz.getMaxScore() > 0)
                    .mapToDouble(quiz ->
                            ((double) quiz.getScore() / quiz.getMaxScore()) * 100
                    )
                    .average()
                    .orElse(0);

            overallAverageScore = BigDecimal.valueOf(average)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // Topic-wise analytics
        List<TopicAnalyticsDto> topicAnalytics =
                progressList.stream()
                        .map(progress ->
                                TopicAnalyticsDto.builder()
                                        .topicId(progress.getTopic().getId().toString())
                                        .topicName(progress.getTopic().getName())
                                        .completionPercentage(progress.getCompletionPercentage())
                                        .quizzesTaken(progress.getQuizzesTaken())
                                        .minutesSpent(progress.getMinutesSpent())
                                        .averageScore(progress.getAverageScore())
                                        .build()
                        )
                        .toList();

        // Recent quiz scores
        List<QuizScoreDto> recentQuizScores =
                recentQuizzes.stream()
                        .map(quiz -> {

                            BigDecimal percentage;

                            if (quiz.getMaxScore() == 0) {

                                percentage = BigDecimal.ZERO;

                            } else {

                                percentage = BigDecimal.valueOf(
                                        ((double) quiz.getScore() / quiz.getMaxScore()) * 100
                                ).setScale(2, RoundingMode.HALF_UP);

                            }

                            return QuizScoreDto.builder()
                                    .quizId(quiz.getId().toString())
                                    .topicName(quiz.getTopic().getName())
                                    .score(quiz.getScore())
                                    .maxScore(quiz.getMaxScore())
                                    .percentage(percentage)
                                    .completedAt(quiz.getCompletedAt())
                                    .build();

                        })
                        .toList();

        // Weak areas
        List<String> weakAreas =
                progressList.stream()
                        .filter(progress ->
                                progress.getQuizzesTaken() > 0
                                        && progress.getAverageScore()
                                        .compareTo(BigDecimal.valueOf(60)) < 0
                        )
                        .map(progress ->
                                progress.getTopic().getName()
                        )
                        .toList();

        // Build dashboard
        return DashboardDto.builder()
                .totalLearningMinutes(totalLearningMinutes)
                .totalTopicsStarted(totalTopicsStarted)
                .totalQuizzesTaken(totalQuizzesTaken)
                .overallAverageScore(overallAverageScore)
                .topicAnalytics(topicAnalytics)
                .recentQuizScores(recentQuizScores)
                .weakAreas(weakAreas)
                .build();
    }

}

