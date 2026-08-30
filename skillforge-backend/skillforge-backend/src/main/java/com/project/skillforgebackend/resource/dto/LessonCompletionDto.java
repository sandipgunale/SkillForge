package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonCompletionDto {

    private String lessonId;
    private boolean completed;
    private LocalDateTime completedAt;
    private Integer lastPositionSeconds;
}
