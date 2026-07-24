package com.project.skillforgebackend.resource.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagDto {

    private String id;

    private String name;

    private String slug;

}