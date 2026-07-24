package com.project.skillforgebackend.resource.mapper;

import com.project.skillforgebackend.resource.dto.TopicDto;
import com.project.skillforgebackend.resource.entity.Topic;
import org.springframework.stereotype.Component;

@Component
public class TopicMapper {

    public TopicDto toDto(Topic topic) {

        if (topic == null) {
            return null;
        }

        return TopicDto.builder()
                .id(topic.getId().toString())
                .name(topic.getName())
                .slug(topic.getSlug())
                .icon(topic.getIcon())
                .build();

    }

}