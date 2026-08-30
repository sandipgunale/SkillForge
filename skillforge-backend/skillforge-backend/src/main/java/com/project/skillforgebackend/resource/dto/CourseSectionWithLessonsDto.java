package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSectionWithLessonsDto {

    private CourseSectionDto section;
    private List<ContentItemDto> lessons;
}
