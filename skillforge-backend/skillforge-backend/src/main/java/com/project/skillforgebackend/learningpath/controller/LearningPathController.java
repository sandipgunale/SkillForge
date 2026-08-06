package com.project.skillforgebackend.learningpath.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.common.security.RateLimiter;
import com.project.skillforgebackend.learningpath.dto.CreateLearningPathRequest;
import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.dto.UpdateLearningPathRequest;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.service.LearningPathRoadmapService;
import com.project.skillforgebackend.learningpath.service.LearningPathService;
import com.project.skillforgebackend.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.project.skillforgebackend.learningpath.dto.UpdateWeekCompletionRequest;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;
    private final LearningPathRoadmapService learningPathRoadmapService;
    private final CurrentUser currentUser;
    private final RateLimiter aiRateLimiter;

    public LearningPathController(LearningPathService learningPathService,
                                  LearningPathRoadmapService learningPathRoadmapService,
                                  CurrentUser currentUser,
                                  @Qualifier("aiRateLimiter") RateLimiter aiRateLimiter) {
        this.learningPathService = learningPathService;
        this.learningPathRoadmapService = learningPathRoadmapService;
        this.currentUser = currentUser;
        this.aiRateLimiter = aiRateLimiter;
    }

    /**
     * Generate a new AI learning roadmap.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LearningPathDto>> createLearningPath(
            @Valid @RequestBody CreateLearningPathRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            HttpServletRequest servletRequest
    ) {
        aiRateLimiter.check(aiRateLimiter.key(clientIp(servletRequest), "learning-path"));

        User user = currentUser.require(principal);

        LearningPathDto response =
                learningPathService.createLearningPath(request, user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Learning path generated successfully.",
                        response
                ));
    }

    /**
     * Get all learning paths.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LearningPathDto>>> getLearningPaths(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        List<LearningPathDto> response =
                learningPathService.getLearningPaths(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning paths fetched successfully.",
                        response
                )
        );
    }

    /**
     * Get one learning path.
     */
    @GetMapping("/{learningPathId}")
    public ResponseEntity<ApiResponse<LearningPathDto>> getLearningPath(
            @PathVariable UUID learningPathId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        LearningPathDto response =
                learningPathService.getLearningPath(
                        learningPathId,
                        user
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path fetched successfully.",
                        response
                )
        );
    }

    /**
     * Update learning path.
     */
    @PutMapping("/{learningPathId}")
    public ResponseEntity<ApiResponse<LearningPathDto>> updateLearningPath(
            @PathVariable UUID learningPathId,
            @Valid @RequestBody UpdateLearningPathRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        LearningPathDto response =
                learningPathService.updateLearningPath(
                        learningPathId,
                        request,
                        user
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path updated successfully.",
                        response
                )
        );
    }

    /**
     * Update status.
     */
    @PatchMapping("/{learningPathId}/status")
    public ResponseEntity<ApiResponse<LearningPathDto>> updateStatus(
            @PathVariable UUID learningPathId,
            @RequestParam LearningPathStatus status,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        LearningPathDto response =
                learningPathService.updateStatus(
                        learningPathId,
                        status,
                        user
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path status updated successfully.",
                        response
                )
        );
    }

    /**
     * Update completion status of a roadmap week.
     */
    @PatchMapping("/{learningPathId}/weeks/{weekNumber}")
    public ResponseEntity<ApiResponse<LearningPathDto>> updateWeekCompletion(
            @PathVariable UUID learningPathId,
            @PathVariable Integer weekNumber,
            @Valid @RequestBody UpdateWeekCompletionRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        LearningPathDto response =
                learningPathRoadmapService.updateWeekCompletion(
                        learningPathId,
                        weekNumber,
                        request,
                        user
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Week completion updated successfully.",
                        response
                )
        );
    }

    /**
     * Delete learning path.
     */
    @DeleteMapping("/{learningPathId}")
    public ResponseEntity<ApiResponse<Void>> deleteLearningPath(
            @PathVariable UUID learningPathId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        learningPathService.deleteLearningPath(
                learningPathId,
                user
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Learning path deleted successfully.",
                        null
                )
        );
    }

    private String clientIp(HttpServletRequest request) {
        // Mirrors AuthController: remote address is the real client IP behind
        // the fronting proxy (server.forward-headers-strategy=framework).
        return request.getRemoteAddr();
    }

}