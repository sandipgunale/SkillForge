package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.*;
import com.project.skillforgebackend.resource.service.CourseSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CourseSectionController {

    private final CourseSectionService courseSectionService;

    @GetMapping("/api/v1/resources/{resourceId}/sections")
    public ResponseEntity<ApiResponse<?>> getSections(
            @PathVariable UUID resourceId,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course sections fetched successfully.",
                courseSectionService.getSections(resourceId, includeInactive)
        ));
    }

    @PostMapping("/api/v1/resources/{resourceId}/sections")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<?>> addSection(
            @PathVariable UUID resourceId,
            @Valid @RequestBody CreateCourseSectionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Course section added successfully.",
                courseSectionService.createSection(resourceId, request)
        ));
    }

    @PutMapping("/api/v1/sections/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<?>> updateSection(
            @PathVariable UUID sectionId,
            @Valid @RequestBody UpdateCourseSectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Course section updated successfully.",
                courseSectionService.updateSection(sectionId, request)
        ));
    }

    @DeleteMapping("/api/v1/sections/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> removeSection(@PathVariable UUID sectionId) {
        courseSectionService.deleteSection(sectionId);
        return ResponseEntity.ok(ApiResponse.success("Course section removed successfully.", null));
    }

    @PutMapping("/api/v1/resources/{resourceId}/sections/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> reorderSections(
            @PathVariable UUID resourceId,
            @Valid @RequestBody ReorderCourseSectionsRequest request
    ) {
        courseSectionService.reorderSections(resourceId, request);
        return ResponseEntity.ok(ApiResponse.success("Section order updated successfully.", null));
    }
}
