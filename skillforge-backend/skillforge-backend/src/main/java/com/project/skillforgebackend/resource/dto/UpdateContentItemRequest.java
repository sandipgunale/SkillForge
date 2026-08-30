package com.project.skillforgebackend.resource.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.skillforgebackend.resource.entity.ContentItem;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateContentItemRequest {

    @Size(max = 300, message = "Title cannot exceed 300 characters.")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
    private String description;

    private ContentItem.ContentItemType type;

    @Size(max = 500, message = "URL cannot exceed 500 characters.")
    private String url;

    @PositiveOrZero(message = "Order must be zero or greater.")
    private Integer orderIndex;

    @Positive(message = "Duration must be greater than zero.")
    private Integer durationMinutes;

    private Boolean required;

    @Size(max = 200, message = "Author cannot exceed 200 characters.")
    private String author;

    @Size(max = 20, message = "ISBN cannot exceed 20 characters.")
    private String isbn;

    private UUID sectionId;

    private Boolean freePreview;

    private JsonNode materials;
}
