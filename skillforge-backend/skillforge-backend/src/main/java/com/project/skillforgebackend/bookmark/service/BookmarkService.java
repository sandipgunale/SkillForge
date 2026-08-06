package com.project.skillforgebackend.bookmark.service;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkStatusDto;
import com.project.skillforgebackend.bookmark.entity.Bookmark;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.bookmark.mapper.BookmarkMapper;
import com.project.skillforgebackend.bookmark.repository.BookmarkFolderRepository;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.common.response.PagedResponseAssembler;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.quiz.dto.PagedResponse;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ApplicationEventPublisher eventPublisher;

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

        Bookmark savedBookmark;
        try {
            savedBookmark = bookmarkRepository.save(bookmark);
        } catch (DataIntegrityViolationException ex) {
            // Race-safe duplicate guard: the (user, resource) unique
            // constraint is the source of truth.
            throw new DataIntegrityViolationException(
                    "Resource is already bookmarked."
            );
        }

        gamificationService.checkAndAwardBadges(user);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BOOKMARK_ADDED,
                user.getId(),
                "resource",
                resourceId.toString(),
                folderId != null ? "folder " + folderId : "no folder"
        ));

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

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BOOKMARK_REMOVED,
                user.getId(),
                "resource",
                resourceId.toString(),
                null
        ));

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

        return PagedResponseAssembler.assemble(page, bookmarkMapper::toDto);
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

    // ---------- Helpers ----------

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

}