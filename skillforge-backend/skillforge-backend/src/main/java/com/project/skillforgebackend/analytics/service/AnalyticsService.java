package com.project.skillforgebackend.analytics.service;

import com.project.skillforgebackend.analytics.builder.DashboardMetricsBuilder;
import com.project.skillforgebackend.analytics.builder.LearningPathAnalyticsBuilder;
import com.project.skillforgebackend.analytics.builder.QuizAnalyticsBuilder;
import com.project.skillforgebackend.analytics.builder.TopicAnalyticsBuilder;
import com.project.skillforgebackend.analytics.builder.WeeklyActivityBuilder;
import com.project.skillforgebackend.analytics.dto.DashboardDto;
import com.project.skillforgebackend.analytics.dto.RecommendationDto;
import com.project.skillforgebackend.analytics.enums.RecommendationPriority;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import com.project.skillforgebackend.learningpathprogress.repository.LearningPathProgressRepository;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.progress.repository.ProgressRepository;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Orchestrates the dashboard: fetches the raw learning rows once and
 * delegates each section to a dedicated builder. The assembled dashboard is
 * cached per user and evicted when learning data changes.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ProgressRepository progressRepository;
    private final QuizRepository quizRepository;
    private final LearningPathProgressRepository learningPathProgressRepository;
    private final WeeklyActivityBuilder weeklyActivityBuilder;
    private final DashboardMetricsBuilder dashboardMetricsBuilder;
    private final TopicAnalyticsBuilder topicAnalyticsBuilder;
    private final QuizAnalyticsBuilder quizAnalyticsBuilder;
    private final LearningPathAnalyticsBuilder learningPathAnalyticsBuilder;

    @Cacheable(cacheNames = "dashboard", key = "#user.id")
    public DashboardDto getDashboard(User user) {

        List<Progress> progressList =
                progressRepository.findByUserOrderByLastActivityAtDesc(user);

        List<LearningPathProgress> learningPathProgressList =
                learningPathProgressRepository.findByUser(user);

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

        int totalQuizzesTaken = (int) quizRepository.countByUserAndStatus(
                user,
                Quiz.QuizStatus.COMPLETED
        );

        DashboardMetricsBuilder.DashboardMetrics metrics =
                dashboardMetricsBuilder.build(
                        progressList,
                        learningPathProgressList,
                        recentQuizzes,
                        totalQuizzesTaken
                );

        TopicAnalyticsBuilder.TopicAnalyticsParts topicParts =
                topicAnalyticsBuilder.build(progressList);

        QuizAnalyticsBuilder.QuizAnalyticsParts quizParts =
                quizAnalyticsBuilder.build(recentQuizzes);

        List<RecommendationDto> recommendations =
                topicParts.recommendations().isEmpty()
                        ? List.of(RecommendationDto.builder()
                                .title("Keep Learning")
                                .reason("Excellent performance! Try a more difficult topic.")
                                .priority(RecommendationPriority.LOW)
                                .build())
                        : topicParts.recommendations();

        return DashboardDto.builder()
                .totalLearningMinutes(metrics.totalLearningMinutes())
                .studyHours(metrics.studyHours())
                .totalTopicsStarted(metrics.totalTopicsStarted())
                .totalQuizzesTaken(metrics.totalQuizzesTaken())
                .overallAverageScore(metrics.overallAverageScore())
                .quizAccuracy(metrics.quizAccuracy())
                .learningHealthScore(metrics.learningHealthScore())
                .learningLevel(metrics.learningLevel())
                .averageMinutesPerTopic(metrics.averageMinutesPerTopic())
                .mostActiveTopic(metrics.mostActiveTopic())

                .bestTopic(topicParts.bestTopic())
                .worstTopic(topicParts.worstTopic())
                .lastQuiz(quizParts.lastQuiz())
                .recommendations(recommendations)
                .completedTopics(metrics.completedTopics())

                .weeklyActivity(weeklyActivityBuilder.build(weeklyProgress))
                .topicAnalytics(topicParts.topicAnalytics())
                .learningPathAnalytics(learningPathAnalyticsBuilder.build(learningPathProgressList))
                .recentQuizScores(quizParts.recentQuizScores())
                .weakAreas(topicParts.weakAreas())
                .hasWeakAreas(!topicParts.weakAreas().isEmpty())
                .build();
    }
}

