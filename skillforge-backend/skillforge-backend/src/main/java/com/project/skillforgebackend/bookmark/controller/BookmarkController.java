package com.project.skillforgebackend.bookmark.controller;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkFolderDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkStatusDto;
import com.project.skillforgebackend.bookmark.dto.CreateFolderRequest;
import com.project.skillforgebackend.bookmark.service.BookmarkService;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    private static final int MAX_PAGE_SIZE = 50;

    private final BookmarkService bookmarkService;

    /**
     * Add bookmark (optionally into a folder).
     */
    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<BookmarkDto>> addBookmark(
            @AuthenticationPrincipal User user,
            @PathVariable UUID resourceId,
            @RequestParam(required = false) UUID folderId
    ) {

        BookmarkDto bookmark =
                bookmarkService.addBookmark(
                        user,
                        resourceId,
                        folderId
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
     * Move a bookmark into a folder (folderId omitted/null = uncategorized).
     */
    @PatchMapping("/{resourceId}/folder")
    public ResponseEntity<ApiResponse<BookmarkDto>> moveBookmark(
            @AuthenticationPrincipal User user,
            @PathVariable UUID resourceId,
            @RequestParam(required = false) UUID folderId
    ) {

        BookmarkDto bookmark =
                bookmarkService.moveBookmark(
                        user,
                        resourceId,
                        folderId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookmark moved successfully.",
                        bookmark
                )
        );
    }

    /**
     * Get bookmarks (paginated, optionally filtered by folderId).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BookmarkDto>>> getBookmarks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        PagedResponse<BookmarkDto> bookmarks =
                bookmarkService.getBookmarks(
                        user,
                        folderId,
                        pageable
                );

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
    @GetMapping("/status/{resourceId}")
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

    // ---------- Folders ----------

    @GetMapping("/folders")
    public ResponseEntity<ApiResponse<List<BookmarkFolderDto>>> getFolders(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bookmark folders fetched successfully.",
                        bookmarkService.getFolders(user)
                )
        );
    }

    @PostMapping("/folders")
    public ResponseEntity<ApiResponse<BookmarkFolderDto>> createFolder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateFolderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Folder created successfully.",
                                bookmarkService.createFolder(user, request)
                        )
                );
    }

    @PutMapping("/folders/{folderId}")
    public ResponseEntity<ApiResponse<BookmarkFolderDto>> renameFolder(
            @AuthenticationPrincipal User user,
            @PathVariable UUID folderId,
            @Valid @RequestBody CreateFolderRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Folder renamed successfully.",
                        bookmarkService.renameFolder(user, folderId, request)
                )
        );
    }

    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @AuthenticationPrincipal User user,
            @PathVariable UUID folderId
    ) {
        bookmarkService.deleteFolder(user, folderId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Folder deleted successfully.",
                        null
                )
        );
    }

}