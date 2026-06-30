package com.project.skillforgebackend.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private String id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String skillLevel;
    private LocalDateTime createdAt;
}
