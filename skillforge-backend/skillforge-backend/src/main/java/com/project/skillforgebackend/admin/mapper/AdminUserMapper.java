package com.project.skillforgebackend.admin.mapper;

import com.project.skillforgebackend.admin.dto.AdminUserDto;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {

    public AdminUserDto toDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .skillLevel(user.getSkillLevel() != null
                        ? user.getSkillLevel().name() : null)
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
