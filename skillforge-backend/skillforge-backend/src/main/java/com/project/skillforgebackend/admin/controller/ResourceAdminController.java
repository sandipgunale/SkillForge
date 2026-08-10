package com.project.skillforgebackend.admin.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.common.response.PagedResponseAssembler;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.resource.dto.CreateResourceRequest;
import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.dto.UpdateResourceRequest;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin resource management: full catalog visibility (including
 * soft-deleted/inactive resources) and restore.
 */
@RestController
@RequestMapping("/api/admin/resources")
@RequiredArgsConstructor
public class ResourceAdminController {

    public static final int MAX_PAGE_SIZE = 50;

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceDto>>> getResources(
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) Resource.Difficulty difficulty,
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), MAX_PAGE_SIZE)
        );

        var resources = resourceService.getResourcesForAdmin(
                topicId,
                difficulty,
                type,
                search,
                active,
                pageable
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resources fetched successfully.",
                        PagedResponseAssembler.assemble(resources, r -> r)
                )
        );
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<ResourceDto>> getResource(
            @PathVariable UUID resourceId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource fetched successfully.",
                        resourceService.getResourceByIdForAdmin(resourceId)
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceDto>> createResource(
            @Valid @RequestBody CreateResourceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Resource created successfully.",
                                resourceService.createResource(request)
                        )
                );
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<ResourceDto>> updateResource(
            @PathVariable UUID resourceId,
            @Valid @RequestBody UpdateResourceRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource updated successfully.",
                        resourceService.updateResource(resourceId, request)
                )
        );
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @PathVariable UUID resourceId
    ) {
        resourceService.deleteResource(resourceId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource deleted successfully.",
                        null
                )
        );
    }

    @PostMapping("/{resourceId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreResource(
            @PathVariable UUID resourceId
    ) {
        resourceService.restoreResource(resourceId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource restored successfully.",
                        null
                )
        );
    }
}