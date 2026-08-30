package com.project.skillforgebackend.resource.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentItemDto {

    private String id;
    private String resourceId;
    private String title;
    private String description;
    private String type;
    private String url;
    private int orderIndex;
    private Integer durationMinutes;
    private boolean required;
    private String youtubeVideoId;
    private String author;
    private String isbn;
    private String sectionId;
    private boolean freePreview;
    private JsonNode materials;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
