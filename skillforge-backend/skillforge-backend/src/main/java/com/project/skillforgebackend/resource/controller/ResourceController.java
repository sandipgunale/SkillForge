package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.CreateResourceRequest;
import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.dto.UpdateResourceRequest;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    public static final int MAX_PAGE_SIZE = 50;

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResourceDto>>> getResources(
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) Resource.Difficulty difficulty,
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), MAX_PAGE_SIZE)
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resources fetched successfully.",
                        resourceService.getResources(
                                topicId,
                                difficulty,
                                type,
                                search,
                                pageable
                        )
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
                        resourceService.getResourceById(resourceId)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ResourceDto>> createResource(
            @Valid @RequestBody CreateResourceRequest request
    ) {

        ResourceDto resource =
                resourceService.createResource(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Resource created successfully.",
                                resource
                        )
                );
    }

    @PutMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<ResourceDto>> updateResource(
            @PathVariable UUID resourceId,
            @Valid @RequestBody UpdateResourceRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource updated successfully.",
                        resourceService.updateResource(
                                resourceId,
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
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

}