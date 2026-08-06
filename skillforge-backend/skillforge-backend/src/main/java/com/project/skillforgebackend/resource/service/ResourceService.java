package com.project.skillforgebackend.resource.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.project.skillforgebackend.resource.dto.CreateTopicRequest;
import com.project.skillforgebackend.resource.dto.UpdateTopicRequest;
import com.project.skillforgebackend.resource.entity.Topic;

import com.project.skillforgebackend.resource.dto.CreateResourceRequest;
import com.project.skillforgebackend.resource.dto.UpdateResourceRequest;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;
    private final ResourceMapper resourceMapper;

    private final TopicMapper topicMapper;

    private final TagRepository tagRepository;

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

    public ResourceDto getResourceById(UUID id) {

        Resource resource = resourceRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource", id));

        return resourceMapper.toDto(resource);
    }

    public List<TopicDto> getAllTopics() {

        return topicRepository
                .findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(topicMapper::toDto)
                .toList();
    }
    public TopicDto getTopic(UUID topicId) {

        return topicMapper.toDto(getTopicEntity(topicId));
    }

    @Transactional
    public TopicDto createTopic(CreateTopicRequest request) {

        Topic topic = Topic.builder()
                .name(request.getName())
                .slug(SlugUtils.generate(request.getName()))
                .description(request.getDescription())
                .displayOrder(0)
                .build();;

        return topicMapper.toDto(
                topicRepository.save(topic)
        );
    }

    @Transactional
    public TopicDto updateTopic(
            UUID topicId,
            UpdateTopicRequest request
    ) {

        Topic topic = getTopicEntity(topicId);

        topic.setName(request.getName());
        topic.setSlug(SlugUtils.generate(request.getName()));
        topic.setDescription(request.getDescription());

        return topicMapper.toDto(
                topicRepository.save(topic)
        );
    }

    @Transactional
    public void deleteTopic(UUID topicId) {

        Topic topic = getTopicEntity(topicId);

        topicRepository.delete(topic);
    }

    @Transactional
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

        return resourceMapper.toDto(
                resourceRepository.save(resource)
        );
    }

    @Transactional
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

        return resourceMapper.toDto(
                resourceRepository.save(resource)
        );
    }

    @Transactional
    public void deleteResource(UUID resourceId) {

        Resource resource = getResourceEntity(resourceId);

        resource.setActive(false);

        resourceRepository.save(resource);
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