package com.project.skillforgebackend.gamification.service;

import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.gamification.Badge;
import com.project.skillforgebackend.gamification.entity.UserBadge;
import com.project.skillforgebackend.gamification.repository.UserBadgeRepository;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.notification.service.NotificationService;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.rating.repository.RatingRepository;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GamificationServiceTest {

    @Mock
    private UserBadgeRepository userBadgeRepository;
    @Mock
    private QuizRepository quizRepository;
    @Mock
    private BookmarkRepository bookmarkRepository;
    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private LearningPathRepository learningPathRepository;
    @Mock
    private NotificationService notificationService;

    private GamificationService gamificationService;

    private User user;

    @BeforeEach
    void setUp() {
        gamificationService = new GamificationService(
                userBadgeRepository,
                quizRepository,
                bookmarkRepository,
                ratingRepository,
                learningPathRepository,
                notificationService
        );

        user = User.builder()
                .id(java.util.UUID.randomUUID())
                .email("test@test.com")
                .fullName("Test User")
                .role(User.Role.STUDENT)
                .build();
    }

    @Test
    void awardsEligibleBadges() {
        when(userBadgeRepository.findCodesByUser(user))
                .thenReturn(Set.of());
        when(quizRepository.countByUserAndStatus(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(1L);
        when(quizRepository.existsPerfectScore(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(true);
        when(bookmarkRepository.countByUser(user)).thenReturn(0L);
        when(ratingRepository.countByUser(user)).thenReturn(0L);
        when(learningPathRepository.countByUserAndStatus(
                user, LearningPathStatus.COMPLETED))
                .thenReturn(0L);

        gamificationService.checkAndAwardBadges(user);

        // FIRST_QUIZ and PERFECT_SCORE both eligible
        verify(userBadgeRepository, times(2)).save(any(UserBadge.class));
        verify(notificationService, times(2)).notify(
                eq(user), eq("BADGE"), any(), any()
        );
    }

    @Test
    void skipsAlreadyOwnedBadges() {
        when(userBadgeRepository.findCodesByUser(user))
                .thenReturn(Set.of(
                        Badge.FIRST_QUIZ.getCode(),
                        Badge.PERFECT_SCORE.getCode()
                ));
        when(quizRepository.countByUserAndStatus(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(1L);
        when(quizRepository.existsPerfectScore(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(true);
        when(bookmarkRepository.countByUser(user)).thenReturn(0L);
        when(ratingRepository.countByUser(user)).thenReturn(0L);
        when(learningPathRepository.countByUserAndStatus(
                user, LearningPathStatus.COMPLETED))
                .thenReturn(0L);

        gamificationService.checkAndAwardBadges(user);

        verify(userBadgeRepository, never()).save(any());
        verify(notificationService, never()).notify(any(), any(), any(), any());
    }

    @Test
    void returnsGamificationSummary() {
        when(userBadgeRepository.findByUserOrderByAwardedAtAsc(user))
                .thenReturn(List.of());
        when(quizRepository.countByUserAndStatus(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(2L);
        when(quizRepository.existsPerfectScore(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(false);
        when(bookmarkRepository.countByUser(user)).thenReturn(5L);
        when(ratingRepository.countByUser(user)).thenReturn(1L);
        when(learningPathRepository.countByUserAndStatus(
                user, LearningPathStatus.COMPLETED))
                .thenReturn(1L);

        var summary = gamificationService.getGamification(user);

        // 2*10 + 5*2 + 1*5 + 1*50 = 85
        assertThat(summary.getPoints()).isEqualTo(85);
        assertThat(summary.getLevel()).isEqualTo("BEGINNER");
        assertThat(summary.getQuizzesCompleted()).isEqualTo(2);
    }

    @Test
    void returnsFullBadgeCatalogWithProgress() {
        when(userBadgeRepository.findByUserOrderByAwardedAtAsc(user))
                .thenReturn(List.of(
                        UserBadge.builder()
                                .id(java.util.UUID.randomUUID())
                                .user(user)
                                .code(Badge.FIRST_QUIZ.getCode())
                                .name(Badge.FIRST_QUIZ.getName())
                                .description(Badge.FIRST_QUIZ.getDescription())
                                .awardedAt(java.time.LocalDateTime.now())
                                .build()
                ));
        when(quizRepository.countByUserAndStatus(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(2L);
        when(quizRepository.existsPerfectScore(
                user, Quiz.QuizStatus.COMPLETED))
                .thenReturn(false);
        when(bookmarkRepository.countByUser(user)).thenReturn(5L);
        when(ratingRepository.countByUser(user)).thenReturn(0L);
        when(learningPathRepository.countByUserAndStatus(
                user, LearningPathStatus.COMPLETED))
                .thenReturn(0L);

        var summary = gamificationService.getGamification(user);

        // 2*10 + 5*2 = 30, plus 25 for the earned badge
        assertThat(summary.getCatalog()).hasSize(Badge.values().length);

        var quizMaster = summary.getCatalog().stream()
                .filter(b -> b.getCode().equals("QUIZ_MASTER"))
                .findFirst()
                .orElseThrow();

        assertThat(quizMaster.isEarned()).isFalse();
        assertThat(quizMaster.getCurrent()).isEqualTo(2);
        assertThat(quizMaster.getTarget()).isEqualTo(10);

        var firstSteps = summary.getCatalog().stream()
                .filter(b -> b.getCode().equals("FIRST_QUIZ"))
                .findFirst()
                .orElseThrow();

        assertThat(firstSteps.isEarned()).isTrue();
        assertThat(firstSteps.getCurrent()).isEqualTo(1);
        assertThat(firstSteps.getTarget()).isEqualTo(1);
        assertThat(firstSteps.getAwardedAt()).isNotNull();
    }
}
