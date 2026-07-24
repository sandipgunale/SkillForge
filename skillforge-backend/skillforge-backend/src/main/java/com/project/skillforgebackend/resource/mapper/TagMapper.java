package com.project.skillforgebackend.resource.mapper;

import com.project.skillforgebackend.resource.dto.TagDto;
import com.project.skillforgebackend.resource.entity.Tag;
import org.springframework.stereotype.Component;

@Component
public class TagMapper {

    public TagDto toDto(Tag tag) {

        if (tag == null) {
            return null;
        }

        return TagDto.builder()
                .id(tag.getId().toString())
                .name(tag.getName())
                .slug(tag.getSlug())
                .build();
    }

}