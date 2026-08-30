package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCurriculumDto {

    private String courseId;
    private List<CourseSectionWithLessonsDto> sections;
    private List<ContentItemDto> uncategorizedLessons;
}
