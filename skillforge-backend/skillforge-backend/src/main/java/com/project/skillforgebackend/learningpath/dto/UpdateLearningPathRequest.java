package com.project.skillforgebackend.learningpath.dto;

import com.project.skillforgebackend.learningpath.enums.SkillLevel;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLearningPathRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 200)
    private String title;

    @Size(max = 300)
    private String goal;

    @NotNull
    private SkillLevel skillLevel;

    @NotNull
    @Min(1)
    @Max(40)
    private Integer weeklyHours;

    @NotNull
    @Min(1)
    @Max(52)
    private Integer durationWeeks;

}