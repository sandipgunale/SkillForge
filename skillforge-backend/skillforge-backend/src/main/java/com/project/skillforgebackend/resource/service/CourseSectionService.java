package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.resource.dto.*;
import com.project.skillforgebackend.resource.entity.CourseSection;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.mapper.CourseSectionMapper;
import com.project.skillforgebackend.resource.repository.CourseSectionRepository;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseSectionService {

    private final CourseSectionRepository courseSectionRepository;
    private final ResourceRepository resourceRepository;
    private final CourseSectionMapper courseSectionMapper;
    private final ApplicationEventPublisher eventPublisher;

    private Resource getCourse(UUID resourceId) {
        Resource resource = resourceRepository.findByIdAndActiveTrue(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", resourceId));
        if (resource.getType() != Resource.ResourceType.COURSE) {
            throw new IllegalStateException("Resource is not a course.");
        }
        return resource;
    }

    @Transactional(readOnly = true)
    public List<CourseSectionDto> getSections(UUID resourceId, boolean includeInactive) {
        getCourse(resourceId);
        List<CourseSection> sections = includeInactive
                ? courseSectionRepository.findAllByResourceId(resourceId)
                : courseSectionRepository.findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(resourceId);
        return sections.stream().map(courseSectionMapper::toDto).toList();
    }

    @Transactional
    public CourseSectionDto createSection(UUID resourceId, CreateCourseSectionRequest request) {
        Resource course = getCourse(resourceId);
        CourseSection section = CourseSection.builder()
                .resource(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : nextOrder(resourceId))
                .active(true)
                .build();
        CourseSection saved = courseSectionRepository.save(section);
        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.COURSE_SECTION_CREATED, null, "courseSection",
                saved.getId().toString(), saved.getTitle()));
        return courseSectionMapper.toDto(saved);
    }

    @Transactional
    public CourseSectionDto updateSection(UUID sectionId, UpdateCourseSectionRequest request) {
        CourseSection section = courseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseSection", sectionId));
        if (request.getTitle() != null) section.setTitle(request.getTitle());
        if (request.getDescription() != null) section.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) section.setOrderIndex(request.getOrderIndex());
        CourseSection saved = courseSectionRepository.save(section);
        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.COURSE_SECTION_UPDATED, null, "courseSection",
                saved.getId().toString(), saved.getTitle()));
        return courseSectionMapper.toDto(saved);
    }

    @Transactional
    public void deleteSection(UUID sectionId) {
        CourseSection section = courseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseSection", sectionId));
        section.setActive(false);
        courseSectionRepository.save(section);
        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.COURSE_SECTION_DELETED, null, "courseSection",
                sectionId.toString(), section.getTitle()));
    }

    @Transactional
    public void reorderSections(UUID resourceId, ReorderCourseSectionsRequest request) {
        getCourse(resourceId);
        List<UUID> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID id = orderedIds.get(i);
            CourseSection section = courseSectionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("CourseSection", id));
            section.setOrderIndex(i);
        }
    }

    private int nextOrder(UUID resourceId) {
        return courseSectionRepository.findAllByResourceId(resourceId).size();
    }
}
