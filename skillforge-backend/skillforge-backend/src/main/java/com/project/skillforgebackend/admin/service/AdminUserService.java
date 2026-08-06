package com.project.skillforgebackend.admin.service;

import com.project.skillforgebackend.admin.dto.AdminUserDto;
import com.project.skillforgebackend.admin.dto.UpdateUserRoleRequest;
import com.project.skillforgebackend.admin.mapper.AdminUserMapper;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.response.PagedResponseAssembler;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
    private final AdminUserMapper adminUserMapper;
    private final ApplicationEventPublisher eventPublisher;

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

        return PagedResponseAssembler.assemble(page, adminUserMapper::toDto);
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

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.ADMIN_USER_UPDATED,
                saved.getId(),
                "user",
                userId,
                "role=" + saved.getRole()
                        + ", active=" + saved.isActive()
        ));

        log.info(
                "Admin updated user {} (role={}, active={})",
                saved.getEmail(),
                saved.getRole(),
                saved.isActive()
        );

        return adminUserMapper.toDto(saved);
    }
}