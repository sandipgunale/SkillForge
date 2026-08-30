package com.project.skillforgebackend.resource.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCourseSectionRequest {

    @NotBlank(message = "Section title is required.")
    @Size(max = 300, message = "Title cannot exceed 300 characters.")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
    private String description;

    @PositiveOrZero(message = "Order must be zero or greater.")
    private Integer orderIndex;
}
