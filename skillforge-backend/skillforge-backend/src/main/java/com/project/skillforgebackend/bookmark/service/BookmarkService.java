package com.project.skillforgebackend.bookmark.service;

import com.project.skillforgebackend.bookmark.dto.BookmarkDto;
import com.project.skillforgebackend.bookmark.dto.BookmarkStatusDto;
import com.project.skillforgebackend.bookmark.entity.Bookmark;
import com.project.skillforgebackend.bookmark.mapper.BookmarkMapper;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final ResourceRepository resourceRepository;
    private final BookmarkMapper bookmarkMapper;

    /**
     * Add a resource to bookmarks.
     */
    public BookmarkDto addBookmark(
            User user,
            UUID resourceId
    ) {

        Resource resource = resourceRepository.findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        ));

        if (bookmarkRepository.existsByUserAndResource(user, resource)) {
            throw new DataIntegrityViolationException(
                    "Resource is already bookmarked."
            );
        }

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .resource(resource)
                .build();

        Bookmark savedBookmark = bookmarkRepository.save(bookmark);

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

        Resource resource = resourceRepository.findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        ));

        Bookmark bookmark = bookmarkRepository
                .findByUserAndResource(user, resource)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bookmark",
                                resourceId
                        ));

        bookmarkRepository.delete(bookmark);

        log.info(
                "User {} removed bookmark for resource {}",
                user.getEmail(),
                resource.getId()
        );
    }

    /**
     * Get all bookmarks of a user.
     */
    @Transactional(readOnly = true)
    public List<BookmarkDto> getBookmarks(
            User user
    ) {

        return bookmarkRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(bookmarkMapper::toDto)
                .toList();
    }

    /**
     * Check bookmark status.
     */
    @Transactional(readOnly = true)
    public BookmarkStatusDto isBookmarked(
            User user,
            UUID resourceId
    ) {

        Resource resource = resourceRepository.findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        ));

        boolean bookmarked =
                bookmarkRepository.existsByUserAndResource(
                        user,
                        resource
                );

        return BookmarkStatusDto.builder()
                .bookmarked(bookmarked)
                .build();
    }

}