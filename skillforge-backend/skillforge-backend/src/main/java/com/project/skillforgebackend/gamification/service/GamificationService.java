package com.project.skillforgebackend.gamification.service;

import com.project.skillforgebackend.gamification.Badge;
import com.project.skillforgebackend.gamification.dto.BadgeCatalogDto;
import com.project.skillforgebackend.gamification.dto.BadgeDto;
import com.project.skillforgebackend.gamification.dto.GamificationDto;
import com.project.skillforgebackend.gamification.entity.UserBadge;
import com.project.skillforgebackend.gamification.repository.UserBadgeRepository;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.notification.service.NotificationService;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.rating.repository.RatingRepository;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private static final int POINTS_PER_QUIZ = 10;
    private static final int POINTS_PER_BOOKMARK = 2;
    private static final int POINTS_PER_RATING = 5;
    private static final int POINTS_PER_PATH = 50;
    private static final int POINTS_PER_BADGE = 25;

    private final UserBadgeRepository userBadgeRepository;
    private final QuizRepository quizRepository;
    private final BookmarkRepository bookmarkRepository;
    private final RatingRepository ratingRepository;
    private final LearningPathRepository learningPathRepository;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Re-evaluates all badge rules and awards any newly earned badges
     * (each badge is awarded once, permanently). Creates a notification
     * for each new badge. Called after quiz submission, bookmarking,
     * rating and learning-path completion.
     */
    @Transactional
    public void checkAndAwardBadges(User user) {
        Badge.BadgeStats stats = collectStats(user);

        Set<String> owned = userBadgeRepository.findCodesByUser(user);

        for (Badge badge : Badge.values()) {

            if (owned.contains(badge.getCode())) {
                continue;
            }

            if (badge.getRule().test(stats)) {

                awardBadge(user, badge);
            }
        }
    }

    @Transactional(readOnly = true)
    public GamificationDto getGamification(User user) {
        Badge.BadgeStats stats = collectStats(user);

        List<BadgeDto> badges = userBadgeRepository
                .findByUserOrderByAwardedAtAsc(user)
                .stream()
                .map(this::toBadgeDto)
                .toList();

        Map<String, BadgeDto> badgesByCode = badges.stream()
                .collect(Collectors.toMap(
                        BadgeDto::getCode,
                        Function.identity()
                ));

        long points = stats.quizzesCompleted() * POINTS_PER_QUIZ
                + stats.bookmarkCount() * POINTS_PER_BOOKMARK
                + stats.ratingCount() * POINTS_PER_RATING
                + stats.pathsCompleted() * POINTS_PER_PATH
                + badges.size() * POINTS_PER_BADGE;

        List<BadgeCatalogDto> catalog = Arrays.stream(Badge.values())
                .map(badge -> toCatalogEntry(
                        badge,
                        stats,
                        badgesByCode
                ))
                .toList();

        return GamificationDto.builder()
                .points(points)
                .level(levelFor(points))
                .badges(badges)
                .catalog(catalog)
                .quizzesCompleted(stats.quizzesCompleted())
                .bookmarks(stats.bookmarkCount())
                .ratings(stats.ratingCount())
                .learningPathsCompleted(stats.pathsCompleted())
                .build();
    }

    private BadgeCatalogDto toCatalogEntry(
            Badge badge,
            Badge.BadgeStats stats,
            Map<String, BadgeDto> badgesByCode
    ) {
        long current = progressFor(badge, stats);
        long target = targetFor(badge);
        BadgeDto earned = badgesByCode.get(badge.getCode());

        return BadgeCatalogDto.builder()
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .earned(earned != null)
                .current(Math.min(current, target))
                .target(target)
                .awardedAt(earned != null ? earned.getAwardedAt() : null)
                .build();
    }

    private long progressFor(
            Badge badge,
            Badge.BadgeStats stats
    ) {
        return switch (badge) {
            case FIRST_QUIZ -> stats.quizzesCompleted();
            case QUIZ_MASTER -> stats.quizzesCompleted();
            case PERFECT_SCORE -> stats.perfectQuiz() ? 1 : 0;
            case FIRST_BOOKMARK -> stats.bookmarkCount();
            case BOOKMARK_COLLECTOR -> stats.bookmarkCount();
            case FIRST_RATING -> stats.ratingCount();
            case PATH_COMPLETER -> stats.pathsCompleted();
        };
    }

    private long targetFor(Badge badge) {
        return switch (badge) {
            case FIRST_QUIZ -> 1;
            case QUIZ_MASTER -> 10;
            case PERFECT_SCORE -> 1;
            case FIRST_BOOKMARK -> 1;
            case BOOKMARK_COLLECTOR -> 20;
            case FIRST_RATING -> 1;
            case PATH_COMPLETER -> 1;
        };
    }

    private void awardBadge(User user, Badge badge) {
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .build();

        userBadgeRepository.save(userBadge);

        notificationService.notify(
                user,
                "BADGE",
                "Badge earned: " + badge.getName(),
                badge.getDescription() + " Keep it up!"
        );

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BADGE_AWARDED,
                user.getId(),
                "badge",
                badge.getCode(),
                badge.getName()
        ));

        log.info(
                "Awarded badge {} to {}",
                badge.getCode(),
                user.getEmail()
        );
    }

    private Badge.BadgeStats collectStats(User user) {
        long quizzesCompleted = quizRepository.countByUserAndStatus(
                user,
                Quiz.QuizStatus.COMPLETED
        );

        boolean perfectQuiz = quizRepository.existsPerfectScore(
                user,
                Quiz.QuizStatus.COMPLETED
        );

        long bookmarks = bookmarkRepository.countByUser(user);
        long ratings = ratingRepository.countByUser(user);

        long pathsCompleted = learningPathRepository.countByUserAndStatus(
                user,
                LearningPathStatus.COMPLETED
        );

        return new Badge.BadgeStats(
                quizzesCompleted,
                perfectQuiz,
                bookmarks,
                ratings,
                pathsCompleted
        );
    }

    private String levelFor(long points) {
        if (points >= 1000) {
            return "LEGEND";
        }
        if (points >= 500) {
            return "ADVANCED";
        }
        if (points >= 200) {
            return "INTERMEDIATE";
        }
        return "BEGINNER";
    }

    private BadgeDto toBadgeDto(UserBadge badge) {
        return BadgeDto.builder()
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .awardedAt(badge.getAwardedAt())
                .build();
    }

}