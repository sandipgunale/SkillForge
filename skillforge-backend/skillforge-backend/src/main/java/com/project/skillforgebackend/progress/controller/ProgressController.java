package com.project.skillforgebackend.progress.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.progress.dto.ProgressDto;
import com.project.skillforgebackend.progress.service.ProgressService;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /**
     * Get logged-in user's learning progress.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProgressDto>> getProgress(
            @AuthenticationPrincipal User user
    ) {

        ProgressDto progress =
                progressService.getProgress(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Progress fetched successfully.",
                        progress
                )
        );
    }

}