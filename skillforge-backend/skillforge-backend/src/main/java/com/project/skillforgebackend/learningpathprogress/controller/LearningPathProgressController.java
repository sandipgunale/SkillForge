package com.project.skillforgebackend.learningpathprogress.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.learningpathprogress.dto.LearningPathProgressDto;
import com.project.skillforgebackend.learningpathprogress.service.LearningPathProgressService;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-path-progress")
@RequiredArgsConstructor
public class LearningPathProgressController {

    private final LearningPathProgressService learningPathProgressService;

    private final CurrentUser currentUser;

    /**
     * Get progress of all learning paths.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LearningPathProgressDto>>> getAllProgress(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        List<LearningPathProgressDto> response =
                learningPathProgressService.getAllProgress(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path progress fetched successfully.",
                        response
                )
        );
    }

    /**
     * Get progress of a specific learning path.
     */
    @GetMapping("/{learningPathId}")
    public ResponseEntity<ApiResponse<LearningPathProgressDto>> getProgress(
            @PathVariable UUID learningPathId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        LearningPathProgressDto response =
                learningPathProgressService.getProgress(
                        learningPathId,
                        user
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path progress fetched successfully.",
                        response
                )
        );
    }

}