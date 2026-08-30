package com.project.skillforgebackend.resource.mapper;

import com.project.skillforgebackend.resource.dto.CourseSectionDto;
import com.project.skillforgebackend.resource.entity.CourseSection;
import org.springframework.stereotype.Component;

@Component
public class CourseSectionMapper {

    public CourseSectionDto toDto(CourseSection section) {

        if (section == null) {
            return null;
        }

        return CourseSectionDto.builder()
                .id(section.getId().toString())
                .resourceId(section.getResource().getId().toString())
                .title(section.getTitle())
                .description(section.getDescription())
                .orderIndex(section.getOrderIndex())
                .active(section.isActive())
                .createdAt(section.getCreatedAt())
                .updatedAt(section.getUpdatedAt())
                .build();
    }
}
