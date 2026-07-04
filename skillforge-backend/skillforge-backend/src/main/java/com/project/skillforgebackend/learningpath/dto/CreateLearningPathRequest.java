package com.project.skillforgebackend.learningpath.dto;

import com.project.skillforgebackend.learningpath.enums.SkillLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLearningPathRequest {

    @NotBlank(message = "Title is required.")
    @Size(max = 200)
    private String title;

    @Size(max = 300)
    private String goal;

    @NotNull(message = "Skill level is required.")
    private SkillLevel skillLevel;

    @NotNull(message = "Weekly hours are required.")
    @Min(value = 1)
    @Max(value = 40)
    private Integer weeklyHours;

    @NotNull
    @Min(1)
    @Max(52)
    private Integer durationWeeks;
}