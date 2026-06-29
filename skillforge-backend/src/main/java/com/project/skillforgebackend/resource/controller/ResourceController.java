package com.project.skillforgebackend.resource.controller;


import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.dto.TopicDto;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.service.ResourceService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDto>> getTopics() {
        return ResponseEntity.ok(resourceService.getAllTopics());
    }

    @GetMapping("/resources")
    public ResponseEntity<Page<ResourceDto>> getResources(
            @RequestParam(required = false) UUID topicId,
            @RequestParam(required = false) Resource.Difficulty difficulty,
            @RequestParam(required = false) Resource.ResourceType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                resourceService.getResources(topicId, difficulty, type, search, pageable)
        );
    }

    @GetMapping("/resources/{id}")
    public ResponseEntity<ResourceDto> getResource(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}
