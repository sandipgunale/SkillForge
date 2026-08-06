package com.project.skillforgebackend.bookmark.service;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkFolderDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkStatusDto;
import com.project.skillforgebackend.bookmark.dto.CreateFolderRequest;
import com.project.skillforgebackend.bookmark.entity.Bookmark;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.bookmark.mapper.BookmarkMapper;
import com.project.skillforgebackend.bookmark.repository.BookmarkFolderRepository;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final BookmarkFolderRepository folderRepository;
    private final ResourceRepository resourceRepository;
    private final BookmarkMapper bookmarkMapper;
    private final GamificationService gamificationService;

    /**
     * Add a resource to bookmarks.
     */
    public BookmarkDto addBookmark(
            User user,
            UUID resourceId,
            UUID folderId
    ) {
        Resource resource = getResource(resourceId);

        if (bookmarkRepository.existsByUserAndResource(user, resource)) {
            throw new DataIntegrityViolationException(
                    "Resource is already bookmarked."
            );
        }

        BookmarkFolder folder = folderId != null
                ? getFolder(user, folderId)
                : null;

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .resource(resource)
                .folder(folder)
                .build();

        Bookmark savedBookmark = bookmarkRepository.save(bookmark);

        gamificationService.checkAndAwardBadges(user);

        log.info(
                "User {} bookmarked resource {}",
                user.getEmail(),
                resource.getId()
        );

        return bookmarkMapper.toDto(savedBookmark);
    }

    /**
     * Remove bookmark.
     */
    public void removeBookmark(
            User user,
            UUID resourceId
    ) {

        Resource resource = getResource(resourceId);

        Bookmark bookmark = getBookmark(user, resource);

        bookmarkRepository.delete(bookmark);

        log.info(
                "User {} removed bookmark for resource {}",
                user.getEmail(),
                resource.getId()
        );
    }

    /**
     * Get bookmarks of a user, optionally filtered by folder, paginated.
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookmarkDto> getBookmarks(
            User user,
            UUID folderId,
            Pageable pageable
    ) {

        Page<Bookmark> page;

        if (folderId != null) {
            BookmarkFolder folder = getFolder(user, folderId);
            page = bookmarkRepository
                    .findByUserAndFolderOrderByCreatedAtDesc(user, folder, pageable);
        } else {
            page = bookmarkRepository
                    .findByUserOrderByCreatedAtDesc(user, pageable);
        }

        return PagedResponse.<BookmarkDto>builder()
                .content(page.getContent()
                        .stream()
                        .map(bookmarkMapper::toDto)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    /**
     * Check bookmark status.
     */
    @Transactional(readOnly = true)
    public BookmarkStatusDto isBookmarked(
            User user,
            UUID resourceId
    ) {

        Resource resource = getResource(resourceId);

        boolean bookmarked =
                bookmarkRepository.existsByUserAndResource(
                        user,
                        resource
                );

        return BookmarkStatusDto.builder()
                .bookmarked(bookmarked)
                .build();
    }

    /**
     * Move a bookmark into a folder (null = uncategorized).
     */
    public BookmarkDto moveBookmark(
            User user,
            UUID resourceId,
            UUID folderId
    ) {
        Resource resource = getResource(resourceId);
        Bookmark bookmark = getBookmark(user, resource);

        bookmark.setFolder(folderId != null
                ? getFolder(user, folderId)
                : null);

        Bookmark saved = bookmarkRepository.save(bookmark);

        log.info(
                "User {} moved bookmark {} to folder {}",
                user.getEmail(),
                resource.getId(),
                folderId
        );

        return bookmarkMapper.toDto(saved);
    }

    // ---------- Folders ----------

    @Transactional(readOnly = true)
    public List<BookmarkFolderDto> getFolders(User user) {
        return folderRepository
                .findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(folder -> toFolderDto(folder, bookmarkRepository.countByFolder(folder)))
                .toList();
    }

    public BookmarkFolderDto createFolder(
            User user,
            CreateFolderRequest request
    ) {
        String name = request.getName().trim();

        if (folderRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new DataIntegrityViolationException(
                    "A folder with this name already exists."
            );
        }

        BookmarkFolder folder = BookmarkFolder.builder()
                .user(user)
                .name(name)
                .build();

        BookmarkFolder saved = folderRepository.save(folder);

        return toFolderDto(saved, 0);
    }

    public BookmarkFolderDto renameFolder(
            User user,
            UUID folderId,
            CreateFolderRequest request
    ) {
        BookmarkFolder folder = getFolder(user, folderId);

        String name = request.getName().trim();

        if (folderRepository.existsByUserAndNameIgnoreCase(user, name)
                && !folder.getName().equalsIgnoreCase(name)) {
            throw new DataIntegrityViolationException(
                    "A folder with this name already exists."
            );
        }

        folder.setName(name);
        BookmarkFolder saved = folderRepository.save(folder);

        return toFolderDto(saved, bookmarkRepository.countByFolder(saved));
    }

    public void deleteFolder(
            User user,
            UUID folderId
    ) {
        BookmarkFolder folder = getFolder(user, folderId);

        // ON DELETE SET NULL removes the folder_id from its bookmarks
        folderRepository.delete(folder);

        log.info(
                "User {} deleted folder {}",
                user.getEmail(),
                folder.getName()
        );
    }

    // ---------- Helpers ----------

    private BookmarkFolder getFolder(User user, UUID folderId) {
        return folderRepository
                .findByIdAndUser(folderId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bookmark folder",
                                folderId
                        )
                );
    }

    private BookmarkFolderDto toFolderDto(
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

    private Resource getResource(
            UUID resourceId
    ) {

        return resourceRepository
                .findByIdAndActiveTrue(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

    }

    private Bookmark getBookmark(
            User user,
            Resource resource
    ) {

        return bookmarkRepository
                .findByUserAndResource(user, resource)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bookmark",
                                resource.getId()
                        )
                );

    }

}