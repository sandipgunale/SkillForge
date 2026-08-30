package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDto {

    private String courseId;
    private int totalLessons;
    private int totalRequiredLessons;
    private int completedRequiredLessons;
    private int completionPercentage;
    private Map<String, Boolean> lessonCompletion;
}
