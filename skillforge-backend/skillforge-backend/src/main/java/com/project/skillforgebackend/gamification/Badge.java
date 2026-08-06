package com.project.skillforgebackend.gamification;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.function.Predicate;

/**
 * Badge catalog. Each badge has a stable code and a rule evaluated
 * against aggregate counters for the user.
 */
@Getter
@RequiredArgsConstructor
public enum Badge {

    FIRST_QUIZ(
            "FIRST_QUIZ",
            "First Steps",
            "Complete your first quiz",
            stats -> stats.quizzesCompleted() >= 1
    ),
    QUIZ_MASTER(
            "QUIZ_MASTER",
            "Quiz Master",
            "Complete 10 quizzes",
            stats -> stats.quizzesCompleted() >= 10
    ),
    PERFECT_SCORE(
            "PERFECT_SCORE",
            "Perfect Score",
            "Score 100% on a quiz",
            stats -> stats.perfectQuiz()
    ),
    FIRST_BOOKMARK(
            "FIRST_BOOKMARK",
            "Collector",
            "Save your first bookmark",
            stats -> stats.bookmarkCount() >= 1
    ),
    BOOKMARK_COLLECTOR(
            "BOOKMARK_COLLECTOR",
            "Bookmark Collector",
            "Save 20 bookmarks",
            stats -> stats.bookmarkCount() >= 20
    ),
    FIRST_RATING(
            "FIRST_RATING",
            "Critic",
            "Rate your first resource",
            stats -> stats.ratingCount() >= 1
    ),
    PATH_COMPLETER(
            "PATH_COMPLETER",
            "Pathfinder",
            "Complete a learning path",
            stats -> stats.pathsCompleted() >= 1
    );

    private final String code;
    private final String name;
    private final String description;
    private final Predicate<BadgeStats> rule;

    /**
     * Immutable snapshot of a user's gamification-relevant counters.
     */
    public record BadgeStats(
            long quizzesCompleted,
            boolean perfectQuiz,
            long bookmarkCount,
            long ratingCount,
            long pathsCompleted
    ) {}
}