package com.project.skillforgebackend.bookmark.mapper;

import com.project.skillforgebackend.bookmark.dto.BookmarkFolderDto;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import org.springframework.stereotype.Component;

@Component
public class BookmarkFolderMapper {

    public BookmarkFolderDto toDto(
            BookmarkFolder folder,
            long bookmarkCount
    ) {
        return BookmarkFolderDto.builder()
                .folderId(folder.getId().toString())
                .name(folder.getName())
                .createdAt(folder.getCreatedAt())
                .bookmarkCount(bookmarkCount)
                .build();
    }
}
