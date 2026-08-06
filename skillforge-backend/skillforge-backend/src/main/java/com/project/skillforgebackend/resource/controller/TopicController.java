package com.project.skillforgebackend.resource.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.resource.dto.CreateTopicRequest;
import com.project.skillforgebackend.resource.dto.TopicDto;
import com.project.skillforgebackend.resource.dto.UpdateTopicRequest;
import com.project.skillforgebackend.resource.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
public class TopicController {

    private final ResourceService resourceService;

    /**
     * Get all topics.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicDto>>> getTopics() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Topics fetched successfully.",
                        resourceService.getAllTopics()
                )
        );
    }

    /**
     * Get topic by id.
     */
    @GetMapping("/{topicId}")
    public ResponseEntity<ApiResponse<TopicDto>> getTopic(
            @PathVariable UUID topicId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Topic fetched successfully.",
                        resourceService.getTopic(topicId)
                )
        );
    }

    /**
     * Create topic.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TopicDto>> createTopic(
            @Valid @RequestBody CreateTopicRequest request
    ) {

        TopicDto topic =
                resourceService.createTopic(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Topic created successfully.",
                                topic
                        )
                );
    }

    /**
     * Update topic.
     */
    @PutMapping("/{topicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TopicDto>> updateTopic(
            @PathVariable UUID topicId,
            @Valid @RequestBody UpdateTopicRequest request
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Topic updated successfully.",
                        resourceService.updateTopic(
                                topicId,
                                request
                        )
                )
        );
    }

    /**
     * Delete topic.
     */
    @DeleteMapping("/{topicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(
            @PathVariable UUID topicId
    ) {

        resourceService.deleteTopic(topicId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Topic deleted successfully.",
                        null
                )
        );
    }

}