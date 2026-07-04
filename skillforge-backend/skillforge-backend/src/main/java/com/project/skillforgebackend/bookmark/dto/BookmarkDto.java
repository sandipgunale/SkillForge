package com.project.skillforgebackend.bookmark.dto;

import com.project.skillforgebackend.resource.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {

    /**
     * Bookmark Information
     */
    private String bookmarkId;

    private LocalDateTime bookmarkedAt;

    /**
     * Resource Information
     */
    private String resourceId;

    private String title;

    private String description;

    private String url;

    private Resource.ResourceType type;

    private Resource.Difficulty difficulty;

    private Integer estimatedMinutes;

    /**
     * Topic Information
     */
    private String topicId;

    private String topicName;

}