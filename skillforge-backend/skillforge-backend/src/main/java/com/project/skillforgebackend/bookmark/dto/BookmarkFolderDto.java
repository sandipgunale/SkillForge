package com.project.skillforgebackend.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkFolderDto {

    private String folderId;
    private String name;
    private LocalDateTime createdAt;
    private long bookmarkCount;

}
