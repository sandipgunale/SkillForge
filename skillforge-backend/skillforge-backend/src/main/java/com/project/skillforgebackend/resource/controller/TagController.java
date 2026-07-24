package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.CreateTagRequest;
import com.project.skillforgebackend.resource.dto.TagDto;
import com.project.skillforgebackend.resource.dto.UpdateTagRequest;
import com.project.skillforgebackend.resource.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagDto>>> getTags() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tags fetched successfully.",
                        tagService.getAllTags()
                )
        );
    }

    @GetMapping("/{tagId}")
    public ResponseEntity<ApiResponse<TagDto>> getTag(
            @PathVariable UUID tagId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tag fetched successfully.",
                        tagService.getTag(tagId)
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TagDto>> createTag(
            @Valid @RequestBody CreateTagRequest request
    ) {

        TagDto tag = tagService.createTag(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Tag created successfully.",
                                tag
                        )
                );
    }

    @PutMapping("/{tagId}")
    public ResponseEntity<ApiResponse<TagDto>> updateTag(
            @PathVariable UUID tagId,
            @Valid @RequestBody UpdateTagRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tag updated successfully.",
                        tagService.updateTag(tagId, request)
                )
        );
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(
            @PathVariable UUID tagId
    ) {

        tagService.deleteTag(tagId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tag deleted successfully.",
                        null
                )
        );
    }

}