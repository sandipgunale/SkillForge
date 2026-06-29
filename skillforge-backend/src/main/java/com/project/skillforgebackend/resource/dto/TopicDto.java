package com.project.skillforgebackend.resource.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDto {

    private String id;

    private String name;

    private String slug;

    private String icon;

}