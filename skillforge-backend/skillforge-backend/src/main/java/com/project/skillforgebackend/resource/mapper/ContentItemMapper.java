package com.project.skillforgebackend.resource.mapper;

import com.project.skillforgebackend.resource.dto.ContentItemDto;
import com.project.skillforgebackend.resource.entity.ContentItem;
import org.springframework.stereotype.Component;

@Component
public class ContentItemMapper {

    public ContentItemDto toDto(ContentItem item) {

        if (item == null) {
            return null;
        }

        return ContentItemDto.builder()
                .id(item.getId().toString())
                .resourceId(item.getResource().getId().toString())
                .title(item.getTitle())
                .description(item.getDescription())
                .type(item.getType().name())
                .url(item.getUrl())
                .orderIndex(item.getOrderIndex())
                .durationMinutes(item.getDurationMinutes())
                .required(item.isRequired())
                .youtubeVideoId(item.getYoutubeVideoId())
                .author(item.getAuthor())
                .isbn(item.getIsbn())
                .sectionId(item.getSection() != null ? item.getSection().getId().toString() : null)
                .freePreview(item.isFreePreview())
                .materials(item.getMaterials())
                .active(item.isActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
