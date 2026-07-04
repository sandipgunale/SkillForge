package com.project.skillforgebackend.learningpath.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.enums.SkillLevel;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathDto {

    private String id;

    private String title;

    private String goal;

    private SkillLevel skillLevel;

    private Integer weeklyHours;

    /**
     * AI generated roadmap JSON.
     */
    private JsonNode roadmapJson;

    private LearningPathStatus status;

    private LocalDateTime completedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer durationWeeks;
}