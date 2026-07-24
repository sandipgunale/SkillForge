package com.project.skillforgebackend.learningpathprogress.mapper;

import com.project.skillforgebackend.learningpathprogress.dto.LearningPathProgressDto;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import org.springframework.stereotype.Component;

@Component
public class LearningPathProgressMapper {

    public LearningPathProgressDto toDto(
            LearningPathProgress progress
    ) {

        return LearningPathProgressDto.builder()
                .id(progress.getId())
                .learningPathId(progress.getLearningPath().getId())
                .learningPathTitle(progress.getLearningPath().getTitle())
                .completedWeeks(progress.getCompletedWeeks())
                .completionPercentage(progress.getCompletionPercentage())
                .quizzesTaken(progress.getQuizzesTaken())
                .averageQuizScore(progress.getAverageQuizScore())
                .minutesSpent(progress.getMinutesSpent())
                .lastActivityAt(progress.getLastActivityAt())
                .build();

    }

}