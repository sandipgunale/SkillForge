package com.project.skillforgebackend.bookmark.controller;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkStatusDto;
import com.project.skillforgebackend.bookmark.service.BookmarkService;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    /**
     * Add bookmark.
     */
    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<BookmarkDto>> addBookmark(
            @AuthenticationPrincipal User user,
            @PathVariable UUID resourceId
    ) {

        BookmarkDto bookmark =
                bookmarkService.addBookmark(
                        user,
                        resourceId
                );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Resource bookmarked successfully.",
                                bookmark
                        )
                );
    }

    /**
     * Remove bookmark.
     */
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @AuthenticationPrincipal User user,
            @PathVariable UUID resourceId
    ) {

        bookmarkService.removeBookmark(
                user,
                resourceId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookmark removed successfully.",
                        null
                )
        );
    }

    /**
     * Get all bookmarks.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookmarkDto>>> getBookmarks(
            @AuthenticationPrincipal User user
    ) {

        List<BookmarkDto> bookmarks =
                bookmarkService.getBookmarks(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookmarks fetched successfully.",
                        bookmarks
                )
        );
    }

    /**
     * Check bookmark status.
     */
    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<BookmarkStatusDto>> isBookmarked(
            @AuthenticationPrincipal User user,
            @PathVariable UUID resourceId
    ) {

        BookmarkStatusDto status =
                bookmarkService.isBookmarked(
                        user,
                        resourceId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookmark status fetched successfully.",
                        status
                )
        );
    }

}