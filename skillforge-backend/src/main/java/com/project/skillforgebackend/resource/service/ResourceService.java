package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.exception.ResourceNotFoundException;
import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.dto.TopicDto;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Tag;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;

    public Page<ResourceDto> getResources(
            UUID topicId,
            Resource.Difficulty difficulty,
            Resource.ResourceType type,
            String search,
            Pageable pageable) {

        if (search != null) {
            search = search.trim();

            if (search.isBlank()) {
                search = null;
            }
        }

        return resourceRepository
                .findAllWithFilters(topicId, difficulty, type, search, pageable)
                .map(this::toDto);
    }

    public ResourceDto getResourceById(UUID id) {

        Resource resource = resourceRepository
                .findByIdActive(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource", id.toString()));

        return toDto(resource);
    }

    public List<TopicDto> getAllTopics() {

        return topicRepository
                .findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::toTopicDto)
                .toList();
    }

    private ResourceDto toDto(Resource resource) {

        return ResourceDto.builder()
                .id(resource.getId().toString())
                .title(resource.getTitle())
                .url(resource.getUrl())
                .type(resource.getType().name())
                .difficulty(resource.getDifficulty().name())
                .youtubeVideoId(resource.getYoutubeVideoId())
                .description(resource.getDescription())
                .avgRating(resource.getAvgRating())
                .ratingCount(resource.getRatingCount())
                .topicId(resource.getTopic().getId().toString())
                .topicName(resource.getTopic().getName())
                .tags(
                        resource.getTags()
                                .stream()
                                .map(Tag::getName)
                                .collect(Collectors.toSet())
                )
                .createdAt(resource.getCreatedAt())
                .build();
    }

    private TopicDto toTopicDto(Topic topic) {

        return TopicDto.builder()
                .id(topic.getId().toString())
                .name(topic.getName())
                .slug(topic.getSlug())
                .icon(topic.getIcon())
                .build();
    }
}