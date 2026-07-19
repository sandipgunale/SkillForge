package com.project.skillforgebackend.bookmark.dto;

import com.project.skillforgebackend.resource.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {

    private String bookmarkId;
    private LocalDateTime bookmarkedAt;

    private String resourceId;
    private String title;
    private String description;
    private String url;

    private Resource.ResourceType type;
    private Resource.Difficulty difficulty;

    private Integer estimatedMinutes;

    private String topicId;
    private String topicName;

    // NEW
    private BigDecimal avgRating;

    private int ratingCount;

}