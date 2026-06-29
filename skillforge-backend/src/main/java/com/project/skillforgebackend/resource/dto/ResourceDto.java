package com.project.skillforgebackend.resource.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDto {

    private String id;

    private String title;

    private String url;

    private String type;

    private String difficulty;

    private String youtubeVideoId;

    private String description;

    private BigDecimal avgRating;

    private int ratingCount;

    private String topicId;

    private String topicName;

    private Set<String> tags;

    private LocalDateTime createdAt;

}
