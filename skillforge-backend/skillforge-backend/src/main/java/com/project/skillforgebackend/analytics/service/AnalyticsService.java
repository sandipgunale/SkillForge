package com.project.skillforgebackend.analytics.service;

import com.project.skillforgebackend.analytics.dto.DashboardDto;
import com.project.skillforgebackend.analytics.dto.QuizScoreDto;
import com.project.skillforgebackend.analytics.dto.TopicAnalyticsDto;
import com.project.skillforgebackend.analytics.enums.LearningLevel;
import com.project.skillforgebackend.analytics.enums.RecommendationPriority;
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
import java.time.LocalDateTime;
import java.util.*;

import com.project.skillforgebackend.analytics.dto.TopicSummaryDto;
import com.project.skillforgebackend.analytics.dto.LastQuizDto;
import com.project.skillforgebackend.analytics.dto.RecommendationDto;

import com.project.skillforgebackend.analytics.dto.WeeklyActivityDto;

import java.time.DayOfWeek;

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

        List<Progress> weeklyProgress =
                progressRepository.findWeeklyProgress(
                        user,
                        LocalDateTime.now().minusDays(6)
                );



        // Total learning time
        int totalLearningMinutes = progressList.stream()
                .mapToInt(Progress::getMinutesSpent)
                .sum();

        String studyHours = String.format(
                "%dh %dm",
                totalLearningMinutes / 60,
                totalLearningMinutes % 60
        );

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

        int learningHealthScore;
        if (progressList.isEmpty()) {

            learningHealthScore = 0;

        } else {

            learningHealthScore = (int) Math.round(

                    (overallAverageScore.doubleValue() * 0.8)

                            +

                            (Math.min(totalTopicsStarted, 10))
                            +

                            (Math.min(totalQuizzesTaken, 20) * 0.5)


            );

            learningHealthScore = Math.min(100, learningHealthScore);

        }

        BigDecimal quizAccuracy = overallAverageScore;

        LearningLevel learningLevel;

        if (overallAverageScore.compareTo(BigDecimal.valueOf(90)) >= 0) {

            learningLevel = LearningLevel.EXPERT;

        } else if (overallAverageScore.compareTo(BigDecimal.valueOf(75)) >= 0) {

            learningLevel = LearningLevel.ADVANCED;

        } else if (overallAverageScore.compareTo(BigDecimal.valueOf(60)) >= 0) {

            learningLevel = LearningLevel.INTERMEDIATE;

        } else {

            learningLevel = LearningLevel.BEGINNER;

        }

        int averageMinutesPerTopic =

                totalTopicsStarted == 0

                        ? 0

                        : totalLearningMinutes / totalTopicsStarted;


        String mostActiveTopic =

                progressList.stream()

                        .max(Comparator.comparing(Progress::getMinutesSpent))

                        .map(progress -> progress.getTopic().getName())

                        .orElse(null);


        int completedTopics =

                (int)

                        progressList.stream()

                                .filter(progress -> progress.getCompletionPercentage() >= 100)

                                .count();

        Map<DayOfWeek, Integer> activityMap =
                new LinkedHashMap<>();

        for (DayOfWeek day : DayOfWeek.values()) {

            activityMap.put(day, 0);

        }

        weeklyProgress.forEach(progress -> {

            DayOfWeek day =
                    progress.getLastActivityAt().getDayOfWeek();

            activityMap.put(
                    day,
                    activityMap.get(day)
                            + progress.getMinutesSpent()
            );

        });

        List<WeeklyActivityDto> weeklyActivity =
                buildWeeklyActivity(weeklyProgress);

        // Topic-wise analytics
        List<TopicAnalyticsDto> topicAnalytics =
                progressList.stream()

                        .sorted(

                                Comparator

                                        .comparing(

                                                Progress::getAverageScore

                                        )

                                        .reversed()

                                        .thenComparing(

                                                Progress::getMinutesSpent,

                                                Comparator.reverseOrder()

                                        )

                        )

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

        TopicSummaryDto bestTopic = progressList.stream()
                .max(Comparator.comparing(Progress::getAverageScore))
                .map(this::buildTopicSummary)
                .orElse(null);

        TopicSummaryDto worstTopic = progressList.stream()
                .filter(progress -> progress.getQuizzesTaken() > 0)
                .min(Comparator.comparing(Progress::getAverageScore))
                .map(this::buildTopicSummary)
                .orElse(null);

        // Recent quiz scores
        List<QuizScoreDto> recentQuizScores =
                recentQuizzes.stream()
                        .map(this::buildQuizScore)
                        .toList();


        LastQuizDto lastQuiz = recentQuizzes.stream()
                .findFirst()
                .map(this::buildLastQuiz)
                .orElse(null);


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

        List<RecommendationDto> recommendations =
                buildRecommendations(progressList);

        if (recommendations.isEmpty()) {

            recommendations = List.of(
                    RecommendationDto.builder()
                            .title("Keep Learning")
                            .reason("Excellent performance! Try a more difficult topic.")
                            .priority(RecommendationPriority.LOW)
                            .build()
            );

        }



        // Build dashboard
        return DashboardDto.builder()
                .totalLearningMinutes(totalLearningMinutes)
                .studyHours(studyHours)
                .totalTopicsStarted(totalTopicsStarted)
                .totalQuizzesTaken(totalQuizzesTaken)
                .overallAverageScore(overallAverageScore)
                .quizAccuracy(quizAccuracy)
                .learningHealthScore(learningHealthScore)
                .learningLevel(learningLevel)
                .averageMinutesPerTopic(averageMinutesPerTopic)
                .mostActiveTopic(mostActiveTopic)

                .bestTopic(bestTopic)
                .worstTopic(worstTopic)
                .lastQuiz(lastQuiz)
                .recommendations(recommendations)
                .completedTopics(completedTopics)

                .weeklyActivity(weeklyActivity)
                .topicAnalytics(topicAnalytics)
                .recentQuizScores(recentQuizScores)
                .weakAreas(weakAreas)
                .hasWeakAreas(!weakAreas.isEmpty())
                .build();
    }


    private TopicSummaryDto buildTopicSummary(Progress progress) {

        return TopicSummaryDto.builder()
                .topicId(progress.getTopic().getId().toString())
                .topicName(progress.getTopic().getName())
                .averageScore(progress.getAverageScore())
                .minutesSpent(progress.getMinutesSpent())
                .quizzesTaken(progress.getQuizzesTaken())
                .build();

    }

    private QuizScoreDto buildQuizScore(Quiz quiz) {

        BigDecimal percentage =
                quiz.getMaxScore() == 0
                        ? BigDecimal.ZERO
                        : BigDecimal.valueOf(
                        ((double) quiz.getScore() / quiz.getMaxScore()) * 100
                ).setScale(2, RoundingMode.HALF_UP);

        return QuizScoreDto.builder()
                .quizId(quiz.getId().toString())
                .topicName(quiz.getTopic().getName())
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .percentage(percentage)
                .completedAt(quiz.getCompletedAt())
                .build();

    }

    private LastQuizDto buildLastQuiz(Quiz quiz) {

        BigDecimal percentage =
                quiz.getMaxScore() == 0
                        ? BigDecimal.ZERO
                        : BigDecimal.valueOf(
                        ((double) quiz.getScore() / quiz.getMaxScore()) * 100
                ).setScale(2, RoundingMode.HALF_UP);

        return LastQuizDto.builder()
                .quizId(quiz.getId().toString())
                .topicName(quiz.getTopic().getName())
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .percentage(percentage)
                .completedAt(quiz.getCompletedAt())
                .build();

    }


    private List<RecommendationDto> buildRecommendations(

            List<Progress> progressList

    ) {

        List<RecommendationDto> recommendations = new ArrayList<>();

        progressList.stream()

                .filter(progress ->

                        progress.getAverageScore()

                                .compareTo(BigDecimal.valueOf(60)) < 0

                )

                .forEach(progress ->

                        recommendations.add(

                                RecommendationDto.builder()

                                        .title(

                                                "Practice "

                                                        + progress.getTopic().getName()

                                        )

                                        .reason(

                                                "Average score below 60%"

                                        )

                                        .priority(

                                                RecommendationPriority.HIGH

                                        )

                                        .build()

                        )

                );

        progressList.stream()

                .filter(progress -> progress.getCompletionPercentage() < 100)
                .sorted(
                        Comparator.comparing(
                                Progress::getCompletionPercentage
                        )
                )
                .limit(2)

                .forEach(progress ->

                        recommendations.add(

                                RecommendationDto.builder()

                                        .title(

                                                "Continue "

                                                        + progress.getTopic().getName()

                                        )

                                        .reason(

                                                "Topic not completed yet"

                                        )

                                        .priority(

                                                RecommendationPriority.MEDIUM

                                        )

                                        .build()

                        )

                );

        if (recommendations.isEmpty()) {

            recommendations.add(

                    RecommendationDto.builder()

                            .title(

                                    "Explore Advanced Topics"

                            )

                            .reason(

                                    "Excellent progress!"

                            )

                            .priority(

                                    RecommendationPriority.LOW

                            )

                            .build()

            );

        }

        return recommendations;

    }

    private List<WeeklyActivityDto> buildWeeklyActivity(
            List<Progress> weeklyProgress
    ) {

        Map<DayOfWeek, Integer> activityMap = new LinkedHashMap<>();

        for (DayOfWeek day : DayOfWeek.values()) {
            activityMap.put(day, 0);
        }

        weeklyProgress.forEach(progress -> {

            DayOfWeek day =
                    progress.getLastActivityAt().getDayOfWeek();

            activityMap.put(
                    day,
                    activityMap.get(day) + progress.getMinutesSpent()
            );

        });

        return activityMap.entrySet()
                .stream()
                .map(entry ->
                        WeeklyActivityDto.builder()
                                .day(entry.getKey().name().substring(0, 3))
                                .minutes(entry.getValue())
                                .build()
                )
                .toList();

    }
}

