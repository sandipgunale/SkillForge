package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.*;
import com.project.skillforgebackend.resource.service.ContentItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ContentItemController {

    private final ContentItemService contentItemService;

    @GetMapping("/api/v1/resources/{resourceId}/content")
    public ResponseEntity<ApiResponse<?>> getContent(
            @PathVariable UUID resourceId,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Content items fetched successfully.",
                contentItemService.getContentItems(resourceId, includeInactive)
        ));
    }

    @PostMapping("/api/v1/resources/{resourceId}/content")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<?>> addContent(
            @PathVariable UUID resourceId,
            @Valid @RequestBody CreateContentItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Content item added successfully.",
                contentItemService.createContentItem(resourceId, request)
        ));
    }

    @PutMapping("/api/v1/content/{contentItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<?>> updateContent(
            @PathVariable UUID contentItemId,
            @Valid @RequestBody UpdateContentItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Content item updated successfully.",
                contentItemService.updateContentItem(contentItemId, request)
        ));
    }

    @DeleteMapping("/api/v1/content/{contentItemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> removeContent(@PathVariable UUID contentItemId) {
        contentItemService.deleteContentItem(contentItemId);
        return ResponseEntity.ok(ApiResponse.success("Content item removed successfully.", null));
    }

    @PutMapping("/api/v1/resources/{resourceId}/content/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Void>> reorderContent(
            @PathVariable UUID resourceId,
            @Valid @RequestBody ReorderContentItemsRequest request
    ) {
        contentItemService.reorderContentItems(resourceId, request);
        return ResponseEntity.ok(ApiResponse.success("Content order updated successfully.", null));
    }
}
