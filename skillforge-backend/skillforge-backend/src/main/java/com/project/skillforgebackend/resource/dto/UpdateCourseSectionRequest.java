package com.project.skillforgebackend.resource.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCourseSectionRequest {

    @Size(max = 300, message = "Title cannot exceed 300 characters.")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
    private String description;

    @PositiveOrZero(message = "Order must be zero or greater.")
    private Integer orderIndex;
}
