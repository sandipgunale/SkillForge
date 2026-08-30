package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.util.SlugUtils;
import com.project.skillforgebackend.common.util.YoutubeUtils;
import com.project.skillforgebackend.resource.dto.ResourceDto;
import com.project.skillforgebackend.resource.dto.TopicDto;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Tag;
import com.project.skillforgebackend.resource.mapper.ResourceMapper;
import com.project.skillforgebackend.resource.mapper.TopicMapper;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.resource.repository.TagRepository;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import com.project.skillforgebackend.resource.dto.CreateTopicRequest;
import com.project.skillforgebackend.resource.dto.UpdateTopicRequest;
import com.project.skillforgebackend.resource.entity.Topic;

import com.project.skillforgebackend.resource.dto.CreateResourceRequest;
import com.project.skillforgebackend.resource.dto.UpdateResourceRequest;
import com.project.skillforgebackend.resource.dto.ContentItemDto;
import com.project.skillforgebackend.resource.dto.CourseCurriculumDto;
import com.project.skillforgebackend.resource.dto.CourseSectionWithLessonsDto;
import com.project.skillforgebackend.resource.entity.ContentItem;
import com.project.skillforgebackend.resource.entity.CourseSection;
import com.project.skillforgebackend.resource.mapper.ContentItemMapper;
import com.project.skillforgebackend.resource.mapper.CourseSectionMapper;
import com.project.skillforgebackend.resource.repository.ContentItemRepository;
import com.project.skillforgebackend.resource.repository.CourseSectionRepository;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;
    private final ResourceMapper resourceMapper;

    private final TopicMapper topicMapper;

    private final TagRepository tagRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final CourseSectionRepository courseSectionRepository;
    private final CourseSectionMapper courseSectionMapper;
    private final ContentItemRepository contentItemRepository;
    private final ContentItemMapper contentItemMapper;

    @Cacheable(cacheNames = "resources", key = "{#topicId, #difficulty, #type, #search, #pageable}")
    public Page<ResourceDto> getResources(
            UUID topicId,
            Resource.Difficulty difficulty,
            Resource.ResourceType type,
            String search,
            Pageable pageable) {

        search = search == null
                ? null
                : search.trim();

        if (search != null && search.isBlank()) {
            search = null;
        }

        return resourceRepository
                .findAllWithFilters(topicId, difficulty, type, search, pageable)
                .map(resourceMapper::toDto);
    }

    @Cacheable(cacheNames = "resources", key = "#id")
    public ResourceDto getResourceById(UUID id) {

        Resource resource = resourceRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource", id));

        return resourceMapper.toDto(resource);
    }

    @Transactional(readOnly = true)
    public Page<ResourceDto> getResourcesForAdmin(
            UUID topicId,
            Resource.Difficulty difficulty,
            Resource.ResourceType type,
            String search,
            Boolean active,
            Pageable pageable) {

        search = search == null ? null : search.trim();

        if (search != null && search.isBlank()) {
            search = null;
        }

        return resourceRepository
                .findAllWithFiltersIncludingInactive(
                        topicId,
                        difficulty,
                        type,
                        search,
                        active,
                        pageable
                )
                .map(resourceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ResourceDto getResourceByIdForAdmin(UUID id) {

        Resource resource = resourceRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource", id));

        return resourceMapper.toDto(resource);
    }

    @Transactional(readOnly = true)
    public CourseCurriculumDto getCourseCurriculum(UUID resourceId) {
        Resource resource = resourceRepository.findByIdAndActiveTrue(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", resourceId));

        List<ContentItem> lessons =
                contentItemRepository.findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(resourceId);

        Map<UUID, List<ContentItem>> grouped = new LinkedHashMap<>();
        for (ContentItem lesson : lessons) {
            UUID key = lesson.getSection() != null ? lesson.getSection().getId() : null;
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(lesson);
        }

        List<CourseSectionWithLessonsDto> sectionDtos = new ArrayList<>();
        if (resource.getType() == Resource.ResourceType.COURSE) {
            List<CourseSection> sections =
                    courseSectionRepository.findAllByResourceIdAndActiveTrueOrderByOrderIndexAsc(resourceId);
            for (CourseSection section : sections) {
                List<ContentItem> secLessons = grouped.getOrDefault(section.getId(), new ArrayList<>());
                sectionDtos.add(CourseSectionWithLessonsDto.builder()
                        .section(courseSectionMapper.toDto(section))
                        .lessons(secLessons.stream().map(contentItemMapper::toDto).toList())
                        .build());
                grouped.remove(section.getId());
            }
        }

        List<ContentItem> uncategorizedItems = grouped.get(null);
        if (uncategorizedItems == null) {
            uncategorizedItems = new ArrayList<>();
        }
        List<ContentItemDto> uncategorized =
                uncategorizedItems.stream().map(contentItemMapper::toDto).toList();

        return CourseCurriculumDto.builder()
                .courseId(resourceId.toString())
                .sections(sectionDtos)
                .uncategorizedLessons(uncategorized)
                .build();
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public ResourceDto restoreResource(UUID resourceId) {

        Resource resource = getResourceEntityAny(resourceId);

        resource.setActive(true);

        Resource saved = resourceRepository.save(resource);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.RESOURCE_UPDATED,
                null,
                "resource",
                resourceId.toString(),
                resource.getTitle()
        ));

        return resourceMapper.toDto(saved);
    }

    @Cacheable(cacheNames = "topics")
    public List<TopicDto> getAllTopics() {

        return topicRepository
                .findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(topicMapper::toDto)
                .toList();
    }
    @Cacheable(cacheNames = "topics", key = "#topicId")
    public TopicDto getTopic(UUID topicId) {

        return topicMapper.toDto(getTopicEntity(topicId));
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public TopicDto createTopic(CreateTopicRequest request) {

        Topic topic = Topic.builder()
                .name(request.getName())
                .slug(SlugUtils.generate(request.getName()))
                .description(request.getDescription())
                .displayOrder(0)
                .build();;

        Topic saved = topicRepository.save(topic);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.TOPIC_CREATED,
                null,
                "topic",
                saved.getId().toString(),
                saved.getName()
        ));

        return topicMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public TopicDto updateTopic(
            UUID topicId,
            UpdateTopicRequest request
    ) {

        Topic topic = getTopicEntity(topicId);

        topic.setName(request.getName());
        topic.setSlug(SlugUtils.generate(request.getName()));
        topic.setDescription(request.getDescription());

        Topic saved = topicRepository.save(topic);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.TOPIC_UPDATED,
                null,
                "topic",
                topicId.toString(),
                saved.getName()
        ));

        return topicMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public void deleteTopic(UUID topicId) {

        Topic topic = getTopicEntity(topicId);

        if (resourceRepository.existsByTopic(topic)) {
            throw new IllegalStateException(
                    "Topic '" + topic.getName()
                            + "' has resources linked to it and cannot be deleted"
            );
        }

        topicRepository.delete(topic);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.TOPIC_DELETED,
                null,
                "topic",
                topicId.toString(),
                topic.getName()
        ));
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public ResourceDto createResource(CreateResourceRequest request) {

        Topic topic = getTopicEntity(request.getTopicId());

        Resource resource = Resource.builder()
                .topic(topic)
                .title(request.getTitle())
                .url(request.getUrl())
                .type(request.getType())
                .difficulty(request.getDifficulty())
                .description(request.getDescription())
                .estimatedMinutes(request.getEstimatedMinutes())
                .youtubeVideoId(YoutubeUtils.extractVideoId(request.getUrl()))
                .tags(getTags(request.getTagIds()))
                .build();

        Resource saved = resourceRepository.save(resource);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.RESOURCE_CREATED,
                null,
                "resource",
                saved.getId().toString(),
                saved.getTitle()
        ));

        return resourceMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public ResourceDto updateResource(
            UUID resourceId,
            UpdateResourceRequest request
    ) {

        Resource resource = getResourceEntity(resourceId);
        Topic topic = getTopicEntity(request.getTopicId());

        resource.setTopic(topic);
        resource.setTitle(request.getTitle());
        resource.setUrl(request.getUrl());
        resource.setType(request.getType());
        resource.setDifficulty(request.getDifficulty());
        resource.setDescription(request.getDescription());
        resource.setEstimatedMinutes(request.getEstimatedMinutes());
        resource.setYoutubeVideoId(YoutubeUtils.extractVideoId(request.getUrl()));
        resource.setTags(
                getTags(request.getTagIds())
        );

        Resource saved = resourceRepository.save(resource);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.RESOURCE_UPDATED,
                null,
                "resource",
                resourceId.toString(),
                saved.getTitle()
        ));

        return resourceMapper.toDto(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"topics", "resources"}, allEntries = true)
    public void deleteResource(UUID resourceId) {

        Resource resource = getResourceEntity(resourceId);

        resource.setActive(false);

        resourceRepository.save(resource);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.RESOURCE_DELETED,
                null,
                "resource",
                resourceId.toString(),
                resource.getTitle()
        ));
    }



    private Topic getTopicEntity(UUID topicId) {

        return topicRepository.findById(topicId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Topic", topicId));
    }


    private Resource getResourceEntity(UUID resourceId) {

        return resourceRepository.findByIdAndActiveTrue(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        ));
    }


    private Resource getResourceEntityAny(UUID resourceId) {

        return resourceRepository.findById(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        ));
    }


    private Set<Tag> getTags(Set<UUID> tagIds) {

        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Tag> tags = tagRepository.findAllByIdIn(tagIds);

        if (tags.size() != tagIds.size()) {
            throw new ResourceNotFoundException(
                    "Tag(s)",
                    tagIds
            );
        }

        return new HashSet<>(tags);
    }
}