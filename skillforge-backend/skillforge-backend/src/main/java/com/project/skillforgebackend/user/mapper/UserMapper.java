package com.project.skillforgebackend.user.mapper;

import com.project.skillforgebackend.auth.dto.AuthResponse;
import com.project.skillforgebackend.user.dto.UserDto;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .skillLevel(user.getSkillLevel() != null
                        ? user.getSkillLevel().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AuthResponse.UserSummary toSummary(User user) {
        return AuthResponse.UserSummary.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
