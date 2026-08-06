package com.project.skillforgebackend.admin.controller;

import com.project.skillforgebackend.admin.dto.AdminUserDto;
import com.project.skillforgebackend.admin.dto.UpdateUserRoleRequest;
import com.project.skillforgebackend.admin.service.AdminUserService;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private static final int MAX_PAGE_SIZE = 50;

    private static final java.util.Set<String> SORTABLE_FIELDS =
            java.util.Set.of("createdAt", "fullName", "email", "role", "isActive");

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserDto>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();

        if (!SORTABLE_FIELDS.contains(sortField)) {
            throw new IllegalArgumentException(
                    "Invalid sort field '" + sortField + "'"
            );
        }

        Sort.Direction sortDirection = sortParts.length > 1
                && "asc".equalsIgnoreCase(sortParts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), MAX_PAGE_SIZE),
                Sort.by(sortDirection, sortField)
        );

        PagedResponse<AdminUserDto> users =
                adminUserService.getUsers(search, pageable);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Users fetched successfully.",
                        users
                )
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        AdminUserDto user = adminUserService.updateUser(userId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "User updated successfully.",
                        user
                )
        );
    }
}