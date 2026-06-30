package com.project.skillforgebackend.user.dto;

import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String fullName;

    @Size(max = 500)
    private String avatarUrl;

    private User.SkillLevel skillLevel;
}