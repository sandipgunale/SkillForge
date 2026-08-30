package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.resource.dto.UpdateResourceRequest;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Tag;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.resource.mapper.ContentItemMapper;
import com.project.skillforgebackend.resource.mapper.CourseSectionMapper;
import com.project.skillforgebackend.resource.mapper.ResourceMapper;
import com.project.skillforgebackend.resource.mapper.TopicMapper;
import com.project.skillforgebackend.resource.repository.ContentItemRepository;
import com.project.skillforgebackend.resource.repository.CourseSectionRepository;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.resource.repository.TagRepository;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private CourseSectionRepository courseSectionRepository;

    @Mock
    private CourseSectionMapper courseSectionMapper;

    @Mock
    private ContentItemRepository contentItemRepository;

    @Mock
    private ContentItemMapper contentItemMapper;

    private ResourceService resourceService;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resourceService = new ResourceService(
                resourceRepository,
                topicRepository,
                new ResourceMapper(),
                new TopicMapper(),
                tagRepository,
                eventPublisher,
                courseSectionRepository,
                courseSectionMapper,
                contentItemRepository,
                contentItemMapper
        );

        Topic topic = Topic.builder()
                .id(UUID.randomUUID())
                .name("Backend")
                .slug("backend")
                .build();

        resource = Resource.builder()
                .id(UUID.randomUUID())
                .title("Spring Boot Guide")
                .url("https://example.com/spring")
                .type(Resource.ResourceType.ARTICLE)
                .difficulty(Resource.Difficulty.BEGINNER)
                .description("Learn Spring Boot")
                .estimatedMinutes(30)
                .topic(topic)
                .tags(Set.of())
                .active(true)
                .build();
    }

    @Test
    void getResourcesForAdminFiltersByActiveFlag() {
        PageRequest pageable = PageRequest.of(0, 12);

        when(resourceRepository.findAllWithFiltersIncludingInactive(
                null, null, null, null, false, pageable))
                .thenReturn(new PageImpl<>(List.of(resource), pageable, 1));

        var result = resourceService.getResourcesForAdmin(
                null, null, null, null, false, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getActive()).isTrue();
    }

    @Test
    void getResourceByIdForAdminReturnsInactiveResource() {
        resource.setActive(false);

        when(resourceRepository.findById(resource.getId()))
                .thenReturn(Optional.of(resource));

        var dto = resourceService.getResourceByIdForAdmin(resource.getId());

        assertThat(dto.getId()).isEqualTo(resource.getId().toString());
        assertThat(dto.getActive()).isFalse();
    }

    @Test
    void getResourceByIdForAdminThrowsWhenMissing() {
        when(resourceRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                resourceService.getResourceByIdForAdmin(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void restoreResourceReactivatesSoftDeletedResource() {
        resource.setActive(false);

        when(resourceRepository.findById(resource.getId()))
                .thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        resourceService.restoreResource(resource.getId());

        assertThat(resource.getActive()).isTrue();
        verify(resourceRepository).save(resource);
    }

    @Test
    void restoreResourceThrowsWhenMissing() {
        when(resourceRepository.findById(any(UUID.class)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                resourceService.restoreResource(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteTopicRejectsTopicWithLinkedResources() {
        Topic topic = resource.getTopic();

        when(topicRepository.findById(topic.getId()))
                .thenReturn(Optional.of(topic));
        when(resourceRepository.existsByTopic(topic))
                .thenReturn(true);

        assertThatThrownBy(() ->
                resourceService.deleteTopic(topic.getId()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("has resources linked");
    }

    @Test
    void deleteTopicDeletesUnusedTopicAndEmitsAudit() {
        Topic topic = resource.getTopic();

        when(topicRepository.findById(topic.getId()))
                .thenReturn(Optional.of(topic));
        when(resourceRepository.existsByTopic(topic))
                .thenReturn(false);

        resourceService.deleteTopic(topic.getId());

        verify(topicRepository).delete(topic);
    }
}