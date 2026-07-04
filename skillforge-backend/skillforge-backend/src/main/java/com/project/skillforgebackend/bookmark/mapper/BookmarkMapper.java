package com.project.skillforgebackend.bookmark.mapper;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.entity.Bookmark;
import org.springframework.stereotype.Component;

@Component
public class BookmarkMapper {

    /**
     * Convert Bookmark Entity to DTO.
     */
    public BookmarkDto toDto(Bookmark bookmark) {

        if (bookmark == null) {
            return null;
        }

        return BookmarkDto.builder()
                .bookmarkId(bookmark.getId().toString())
                .bookmarkedAt(bookmark.getCreatedAt())

                .resourceId(bookmark.getResource().getId().toString())
                .title(bookmark.getResource().getTitle())
                .description(bookmark.getResource().getDescription())
                .url(bookmark.getResource().getUrl())
                .type(bookmark.getResource().getType())
                .difficulty(bookmark.getResource().getDifficulty())
                .estimatedMinutes(bookmark.getResource().getEstimatedMinutes())

                .topicId(bookmark.getResource().getTopic().getId().toString())
                .topicName(bookmark.getResource().getTopic().getName())

                .build();
    }

}