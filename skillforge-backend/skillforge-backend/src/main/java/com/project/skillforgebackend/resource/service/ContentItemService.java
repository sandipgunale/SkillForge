package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.exception.ContentItemNotFoundException;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.util.MediaUrlUtils;
import com.project.skillforgebackend.common.util.YoutubeUtils;
import com.project.skillforgebackend.resource.dto.*;
import com.project.skillforgebackend.resource.entity.ContentItem;
import com.project.skillforgebackend.resource.entity.CourseSection;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.mapper.ContentItemMapper;
import com.project.skillforgebackend.resource.repository.ContentItemRepository;
import com.project.skillforgebackend.resource.repository.CourseSectionRepository;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentItemService {

    private final ContentItemRepository contentItemRepository;
    private final ResourceRepository resourceRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final ContentItemMapper contentItemMapper;

    private Resource getResource(UUID resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", resourceId));
    }

    @Transactional(readOnly = true)
    public List<ContentItemDto> getContentItems(UUID resourceId, boolean includeInactive) {
        getResource(resourceId);
        List<ContentItem> items = includeInactive
                ? contentItemRepository.findAllByResourceId(resourceId)
                : contentItemRepository.findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(resourceId);
        return items.stream().map(contentItemMapper::toDto).toList();
    }

    @Transactional
    public ContentItemDto createContentItem(UUID resourceId, CreateContentItemRequest request) {
        Resource resource = getResource(resourceId);

        if (request.getUrl() != null && !request.getUrl().isBlank()) {
            MediaUrlUtils.sanitize(request.getUrl());
        }

        CourseSection section = null;
        if (request.getSectionId() != null) {
            section = courseSectionRepository.findById(request.getSectionId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("CourseSection", request.getSectionId()));
        }

        ContentItem item = ContentItem.builder()
                .resource(resource)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .url(request.getUrl())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : nextOrder(resourceId))
                .durationMinutes(request.getDurationMinutes())
                .required(request.getRequired() != null ? request.getRequired() : true)
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .section(section)
                .freePreview(request.getFreePreview() != null ? request.getFreePreview() : false)
                .materials(MediaUrlUtils.sanitizeMaterials(request.getMaterials()))
                .youtubeVideoId(YoutubeUtils.extractVideoId(request.getUrl()))
                .active(true)
                .build();

        return contentItemMapper.toDto(contentItemRepository.save(item));
    }

    @Transactional
    public ContentItemDto updateContentItem(UUID contentItemId, UpdateContentItemRequest request) {
        ContentItem item = contentItemRepository.findById(contentItemId)
                .orElseThrow(() -> new ContentItemNotFoundException("ContentItem", contentItemId));

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getType() != null) item.setType(request.getType());
        if (request.getUrl() != null) {
            item.setUrl(request.getUrl());
            item.setYoutubeVideoId(YoutubeUtils.extractVideoId(request.getUrl()));
        }
        if (request.getOrderIndex() != null) item.setOrderIndex(request.getOrderIndex());
        if (request.getDurationMinutes() != null) item.setDurationMinutes(request.getDurationMinutes());
        if (request.getRequired() != null) item.setRequired(request.getRequired());
        if (request.getAuthor() != null) item.setAuthor(request.getAuthor());
        if (request.getIsbn() != null) item.setIsbn(request.getIsbn());
        if (request.getSectionId() != null) {
            item.setSection(courseSectionRepository.findById(request.getSectionId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("CourseSection", request.getSectionId())));
        }
        if (request.getFreePreview() != null) item.setFreePreview(request.getFreePreview());
        if (request.getMaterials() != null) {
            item.setMaterials(MediaUrlUtils.sanitizeMaterials(request.getMaterials()));
        }

        return contentItemMapper.toDto(contentItemRepository.save(item));
    }

    @Transactional
    public void deleteContentItem(UUID contentItemId) {
        ContentItem item = contentItemRepository.findById(contentItemId)
                .orElseThrow(() -> new ContentItemNotFoundException("ContentItem", contentItemId));
        item.setActive(false);
        contentItemRepository.save(item);
    }

    @Transactional
    public void reorderContentItems(UUID resourceId, ReorderContentItemsRequest request) {
        getResource(resourceId);
        List<UUID> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            final UUID id = orderedIds.get(i);
            ContentItem item = contentItemRepository.findById(id)
                    .orElseThrow(() -> new ContentItemNotFoundException("ContentItem", id));
            item.setOrderIndex(i);
        }
    }

    private int nextOrder(UUID resourceId) {
        return contentItemRepository.findAllByResourceId(resourceId).size();
    }
}
