package com.project.skillforgebackend.learningpath.mapper;

import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.entity.LearningPath;
import org.springframework.stereotype.Component;

@Component
public class LearningPathMapper {

    /**
     * Convert LearningPath entity to DTO.
     */
    public LearningPathDto toDto(
            LearningPath learningPath
    ) {

        if (learningPath == null) {
            return null;
        }

        return LearningPathDto.builder()
                .id(learningPath.getId().toString())
                .title(learningPath.getTitle())
                .goal(learningPath.getGoal())
                .skillLevel(learningPath.getSkillLevel())
                .weeklyHours(learningPath.getWeeklyHours())
                .durationWeeks(learningPath.getDurationWeeks())
                .roadmapJson(learningPath.getRoadmapJson())
                .status(learningPath.getStatus())
                .completedAt(learningPath.getCompletedAt())
                .createdAt(learningPath.getCreatedAt())
                .updatedAt(learningPath.getUpdatedAt())
                .build();
    }

}