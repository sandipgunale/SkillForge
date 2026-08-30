package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.CourseProgressDto;
import com.project.skillforgebackend.resource.service.LessonCompletionService;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LessonCompletionController {

    private final LessonCompletionService lessonCompletionService;
    private final CurrentUser currentUser;

    @GetMapping("/api/v1/resources/{courseId}/progress")
    public ResponseEntity<ApiResponse<CourseProgressDto>> getProgress(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID courseId
    ) {
        User user = currentUser.require(principal);
        return ResponseEntity.ok(ApiResponse.success(
                "Course progress fetched successfully.",
                lessonCompletionService.getProgress(user, courseId)
        ));
    }

    @GetMapping("/api/v1/course-progress")
    public ResponseEntity<ApiResponse<Map<String, CourseProgressDto>>> getProgressBatch(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam List<UUID> courseIds
    ) {
        User user = currentUser.require(principal);
        return ResponseEntity.ok(ApiResponse.success(
                "Course progress fetched successfully.",
                lessonCompletionService.getProgressForCourses(user, courseIds)
        ));
    }

    @PostMapping("/api/v1/resources/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Void>> markComplete(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId
    ) {
        User user = currentUser.require(principal);
        lessonCompletionService.markComplete(user, courseId, lessonId, true);
        return ResponseEntity.ok(ApiResponse.success("Lesson marked complete.", null));
    }

    @DeleteMapping("/api/v1/resources/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Void>> markIncomplete(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId
    ) {
        User user = currentUser.require(principal);
        lessonCompletionService.markComplete(user, courseId, lessonId, false);
        return ResponseEntity.ok(ApiResponse.success("Lesson marked incomplete.", null));
    }
}
