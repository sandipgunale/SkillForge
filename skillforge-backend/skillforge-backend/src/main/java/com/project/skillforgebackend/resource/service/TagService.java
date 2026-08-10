package com.project.skillforgebackend.resource.service;

import com.project.skillforgebackend.common.exception.DuplicateResourceException;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.util.SlugUtils;
import com.project.skillforgebackend.resource.dto.CreateTagRequest;
import com.project.skillforgebackend.resource.dto.TagDto;
import com.project.skillforgebackend.resource.dto.UpdateTagRequest;
import com.project.skillforgebackend.resource.entity.Tag;
import com.project.skillforgebackend.resource.mapper.TagMapper;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.resource.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;
    private final ResourceRepository resourceRepository;

    @Cacheable(cacheNames = "tags")
    public List<TagDto> getAllTags() {

        return tagRepository.findAllByOrderByNameAsc()
                .stream()
                .map(tagMapper::toDto)
                .toList();
    }

    @Cacheable(cacheNames = "tags", key = "#tagId")
    public TagDto getTag(UUID tagId) {

        return tagMapper.toDto(
                getTagEntity(tagId)
        );
    }

    @Transactional
    @CacheEvict(cacheNames = {"tags", "resources"}, allEntries = true)
    public TagDto createTag(CreateTagRequest request) {

        if (tagRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Tag", request.getName());
        }

        Tag tag = Tag.builder()
                .name(request.getName())
                .slug(generateUniqueSlug(request.getName()))
                .build();

        return tagMapper.toDto(
                tagRepository.save(tag)
        );
    }

    @Transactional
    @CacheEvict(cacheNames = {"tags", "resources"}, allEntries = true)
    public TagDto updateTag(
            UUID tagId,
            UpdateTagRequest request
    ) {

        Tag tag = getTagEntity(tagId);

        if (!tag.getName().equalsIgnoreCase(request.getName())
                && tagRepository.existsByNameIgnoreCase(request.getName())) {

            throw new DuplicateResourceException("Tag", request.getName());
        }

        tag.setName(request.getName());
        tag.setSlug(generateUniqueSlug(request.getName()));

        return tagMapper.toDto(
                tagRepository.save(tag)
        );
    }

    @Transactional
    @CacheEvict(cacheNames = {"tags", "resources"}, allEntries = true)
    public void deleteTag(UUID tagId) {

        Tag tag = getTagEntity(tagId);

        if (resourceRepository.existsByTagsContaining(tag)) {
            throw new IllegalStateException(
                    "Tag '" + tag.getName()
                            + "' is used by resources and cannot be deleted"
            );
        }

        tagRepository.delete(tag);
    }

    private Tag getTagEntity(UUID tagId) {

        return tagRepository.findById(tagId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tag",
                                tagId
                        ));
    }

    private String generateUniqueSlug(String name) {

        String slug = SlugUtils.generate(name);

        if (tagRepository.existsBySlug(slug)) {
            slug += "-" + System.currentTimeMillis();
        }

        return slug;
    }

}