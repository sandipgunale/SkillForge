package com.project.skillforgebackend.resource.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderCourseSectionsRequest {

    @NotNull(message = "Ordered section IDs are required.")
    @NotEmpty(message = "Ordered section IDs cannot be empty.")
    private List<UUID> orderedIds;
}
