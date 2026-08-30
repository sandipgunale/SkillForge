package com.project.skillforgebackend.resource.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.skillforgebackend.resource.entity.Resource;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResourceRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 200, message = "Title cannot exceed 200 characters.")
    private String title;

    @NotBlank(message = "Description is required.")
    @Size(max = 1000, message = "Description cannot exceed 1000 characters.")
    private String description;

    @NotBlank(message = "URL is required.")
    @Pattern(
            regexp = "^(https?://).+",
            message = "Invalid URL."
    )
    private String url;

    @NotNull(message = "Resource type is required.")
    private Resource.ResourceType type;

    @NotNull(message = "Difficulty is required.")
    private Resource.Difficulty difficulty;

    @NotNull(message = "Estimated minutes is required.")
    @Positive(message = "Estimated minutes must be greater than zero.")
    private Integer estimatedMinutes;

    @NotNull(message = "Topic is required.")
    private UUID topicId;

    @NotNull
    @Builder.Default
    private Set<UUID> tagIds = new HashSet<>();

    private Resource.CourseLevel courseLevel;

    private JsonNode courseOutcomes;

    private JsonNode courseResources;

}