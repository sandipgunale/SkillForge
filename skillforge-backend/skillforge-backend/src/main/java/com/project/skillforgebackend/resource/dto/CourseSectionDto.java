package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSectionDto {

    private String id;
    private String resourceId;
    private String title;
    private String description;
    private int orderIndex;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
