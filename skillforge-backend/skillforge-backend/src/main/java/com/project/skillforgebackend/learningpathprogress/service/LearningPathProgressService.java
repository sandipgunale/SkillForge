package com.project.skillforgebackend.learningpathprogress.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.repository.LearningPathRepository;
import com.project.skillforgebackend.learningpathprogress.dto.LearningPathProgressDto;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import com.project.skillforgebackend.learningpathprogress.mapper.LearningPathProgressMapper;
import com.project.skillforgebackend.learningpathprogress.repository.LearningPathProgressRepository;
import com.project.skillforgebackend.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LearningPathProgressService {
    private static final int DEFAULT_MINUTES = 0;

    private final LearningPathProgressRepository learningPathProgressRepository;
    private final LearningPathRepository learningPathRepository;
    private final LearningPathProgressMapper learningPathProgressMapper;

    /**
     * Update progress after completing a Learning Path quiz.
     */
    public void updateAfterLearningPathQuiz(
            User user,
            LearningPath learningPath,
            Integer weekNumber,
            double score,
            Integer minutesSpent
    ) {

        LearningPathProgress progress =
                getOrCreateProgress(user, learningPath);

        updateQuizStatistics(progress, score);

        updateCompletedWeeks(progress, weekNumber);

        progress.setMinutesSpent(
                progress.getMinutesSpent() + (minutesSpent == null ? DEFAULT_MINUTES : minutesSpent)
        );

        progress.setLastActivityAt(LocalDateTime.now());

        learningPathProgressRepository.save(progress);
    }

    /**
     * Get progress of one learning path.
     */
    @Transactional(readOnly = true)
    public LearningPathProgressDto getProgress(
            UUID learningPathId,
            User user
    ) {

        LearningPath learningPath =
                learningPathRepository
                        .findByIdAndUser(
                                learningPathId,
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Learning Path",
                                        learningPathId
                                )
                        );

        LearningPathProgress progress =
                getOrCreateProgress(user, learningPath);

        return learningPathProgressMapper.toDto(progress);

    }

    /**
     * Get all learning path progress of current user.
     */
    @Transactional(readOnly = true)
    public List<LearningPathProgressDto> getAllProgress(
            User user
    ) {

        return learningPathProgressRepository
                .findByUser(user)
                .stream()
                .map(learningPathProgressMapper::toDto)
                .toList();
    }

    /**
     * Find existing progress or create a new one.
     */
    private LearningPathProgress getOrCreateProgress(
            User user,
            LearningPath learningPath
    ) {

        return learningPathProgressRepository
                .findByUserAndLearningPath(
                        user,
                        learningPath
                )
                .orElseGet(() ->
                        LearningPathProgress.builder()
                                .user(user)
                                .learningPath(learningPath)
                                .build()
                );
    }

    /**
     * Update quiz count and average score.
     */
    private void updateQuizStatistics(
            LearningPathProgress progress,
            double latestScore
    ) {

        int previousQuizCount = progress.getQuizzesTaken();

        BigDecimal previousAverage = progress.getAverageQuizScore();

        BigDecimal totalScore =
                previousAverage.multiply(
                        BigDecimal.valueOf(previousQuizCount)
                );

        totalScore = totalScore.add(
                BigDecimal.valueOf(latestScore)
        );

        int updatedQuizCount = previousQuizCount + 1;

        BigDecimal updatedAverage =
                totalScore.divide(
                        BigDecimal.valueOf(updatedQuizCount),
                        2,
                        RoundingMode.HALF_UP
                );

        progress.setQuizzesTaken(updatedQuizCount);
        progress.setAverageQuizScore(updatedAverage);
    }

    /**
     * Update completed weeks and completion percentage.
     */
    private void updateCompletedWeeks(
            LearningPathProgress progress,
            Integer weekNumber
    ) {

        if (!progress.getCompletedWeeks().contains(weekNumber)) {
            progress.getCompletedWeeks().add(weekNumber);
        }

        progress.setCompletionPercentage(
                calculateCompletionPercentage(
                        progress.getCompletedWeeks().size(),
                        progress.getLearningPath().getDurationWeeks()
                )
        );
    }

    /**
     * Calculate completion percentage.
     */
    private short calculateCompletionPercentage(
            int completedWeeks,
            int totalWeeks
    ) {

        if (totalWeeks <= 0) {
            return 0;
        }

        return (short) Math.round(
                (completedWeeks * 100.0) / totalWeeks
        );
    }

}