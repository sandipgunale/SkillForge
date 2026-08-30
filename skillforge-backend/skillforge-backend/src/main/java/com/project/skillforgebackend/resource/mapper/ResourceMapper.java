package com.project.skillforgebackend.resource.mapper;

import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Tag;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ResourceMapper {

    public ResourceDto toDto(Resource resource) {

        if (resource == null) {
            return null;
        }

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
                .estimatedMinutes(resource.getEstimatedMinutes())
                .active(resource.getActive())
                .courseLevel(resource.getCourseLevel() != null ? resource.getCourseLevel().name() : null)
                .courseOutcomes(resource.getCourseOutcomes())
                .courseResources(resource.getCourseResources())
                .build();
    }

}