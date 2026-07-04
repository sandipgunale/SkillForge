package com.project.skillforgebackend.learningpath.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.learningpath.dto.CreateLearningPathRequest;
import com.project.skillforgebackend.learningpath.dto.LearningPathDto;
import com.project.skillforgebackend.learningpath.dto.UpdateLearningPathRequest;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.learningpath.service.LearningPathService;
import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-paths")
@RequiredArgsConstructor
public class LearningPathController {

    private final LearningPathService learningPathService;

    /**
     * Generate a new AI learning roadmap.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LearningPathDto>> createLearningPath(
            @Valid @RequestBody CreateLearningPathRequest request,
            @AuthenticationPrincipal User user
    ) {

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
            @AuthenticationPrincipal User user
    ) {

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
            @AuthenticationPrincipal User user
    ) {

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
            @AuthenticationPrincipal User user
    ) {

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
            @AuthenticationPrincipal User user
    ) {

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
     * Delete learning path.
     */
    @DeleteMapping("/{learningPathId}")
    public ResponseEntity<ApiResponse<Void>> deleteLearningPath(
            @PathVariable UUID learningPathId,
            @AuthenticationPrincipal User user
    ) {

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

}