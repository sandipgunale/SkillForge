package com.project.skillforgebackend.admin.service;

import com.project.skillforgebackend.admin.dto.UpdateUserRoleRequest;
import com.project.skillforgebackend.admin.mapper.AdminUserMapper;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private AdminUserService adminUserService;

    private User user;

    private final UUID actingAdminId = UUID.fromString(
            "00000000-0000-0000-0000-000000000001"
    );

    @BeforeEach
    void setUp() {
        adminUserService = new AdminUserService(
                userRepository,
                new AdminUserMapper(),
                eventPublisher
        );

        user = User.builder()
                .id(UUID.randomUUID())
                .email("student@test.com")
                .fullName("Student")
                .role(User.Role.STUDENT)
                .isActive(true)
                .build();
    }

    @Test
    void getUsersWithoutSearchReturnsAll() {
        PageRequest pageable = PageRequest.of(0, 10);

        when(userRepository.findAll(eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(user), pageable, 1));

        var result = adminUserService.getUsers(null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getEmail())
                .isEqualTo("student@test.com");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getUsersWithSearchDelegatesToFilteredQuery() {
        PageRequest pageable = PageRequest.of(0, 10);

        when(userRepository
                .findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                        "stud", "stud", pageable))
                .thenReturn(new PageImpl<>(List.of(user), pageable, 1));

        var result = adminUserService.getUsers("stud", pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void updateUserChangesRoleAndActiveFlag() {
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var request = UpdateUserRoleRequest.builder()
                .role("INSTRUCTOR")
                .isActive(false)
                .build();

        var updated = adminUserService.updateUser(
                user.getId().toString(),
                request,
                actingAdminId
        );

        assertThat(updated.getRole()).isEqualTo("INSTRUCTOR");
        assertThat(updated.isActive()).isFalse();
        verify(userRepository).save(user);
    }

    @Test
    void updateUserRejectsUnknownRole() {
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));

        var request = UpdateUserRoleRequest.builder()
                .role("SUPERUSER")
                .build();

        assertThatThrownBy(() ->
                adminUserService.updateUser(
                        user.getId().toString(),
                        request,
                        actingAdminId
                ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid role");
    }

    @Test
    void updateUserThrowsWhenMissing() {
        when(userRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

        var request = UpdateUserRoleRequest.builder()
                .role("STUDENT")
                .build();

        assertThatThrownBy(() ->
                adminUserService.updateUser(
                        UUID.randomUUID().toString(),
                        request,
                        actingAdminId
                ))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateUserRejectsSelfModification() {
        var request = UpdateUserRoleRequest.builder()
                .role("INSTRUCTOR")
                .build();

        assertThatThrownBy(() ->
                adminUserService.updateUser(
                        actingAdminId.toString(),
                        request,
                        actingAdminId
                ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("own role");
    }

    @Test
    void updateUserRejectsSelfDisable() {
        var request = UpdateUserRoleRequest.builder()
                .isActive(false)
                .build();

        assertThatThrownBy(() ->
                adminUserService.updateUser(
                        actingAdminId.toString(),
                        request,
                        actingAdminId
                ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("own role");
    }

    @Test
    void updateUserDoesNotModifyOwnAccount() {
        var request = UpdateUserRoleRequest.builder()
                .role("ADMIN")
                .isActive(true)
                .build();

        assertThatThrownBy(() ->
                adminUserService.updateUser(
                        actingAdminId.toString(),
                        request,
                        actingAdminId
                ))
                .isInstanceOf(IllegalStateException.class);

        verify(userRepository, never()).save(any(User.class));
    }
}
