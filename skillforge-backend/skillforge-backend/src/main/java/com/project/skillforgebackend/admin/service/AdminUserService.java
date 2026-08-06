package com.project.skillforgebackend.admin.service;

import com.project.skillforgebackend.admin.dto.AdminUserDto;
import com.project.skillforgebackend.admin.dto.UpdateUserRoleRequest;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserDto> getUsers(String search, Pageable pageable) {
        Page<User> page;

        if (StringUtils.hasText(search)) {
            page = userRepository
                    .findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                            search.trim(),
                            search.trim(),
                            pageable
                    );
        } else {
            page = userRepository.findAll(pageable);
        }

        return PagedResponse.<AdminUserDto>builder()
                .content(page.getContent()
                        .stream()
                        .map(this::toDto)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional
    public AdminUserDto updateUser(String userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(java.util.UUID.fromString(userId))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                java.util.UUID.fromString(userId)
                        )
                );

        if (request.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(request.getRole()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException(
                        "Invalid role. Must be one of STUDENT, INSTRUCTOR, ADMIN"
                );
            }
        }

        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        User saved = userRepository.save(user);

        log.info(
                "Admin updated user {} (role={}, active={})",
                saved.getEmail(),
                saved.getRole(),
                saved.isActive()
        );

        return toDto(saved);
    }

    private AdminUserDto toDto(User user) {
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