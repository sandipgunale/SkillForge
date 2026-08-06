package com.project.skillforgebackend.user.dto;

import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @Size(max = 500)
    @Pattern(
            regexp = "^(https?://.+|)$",
            message = "Avatar URL must be a valid http(s) URL"
    )
    private String avatarUrl;

    private User.SkillLevel skillLevel;
}