package com.project.skillforgebackend.bookmark.service;

import com.project.skillforgebackend.bookmark.dto.BookmarkFolderDto;
import com.project.skillforgebackend.bookmark.dto.CreateFolderRequest;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.bookmark.mapper.BookmarkFolderMapper;
import com.project.skillforgebackend.bookmark.repository.BookmarkFolderRepository;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Lifecycle of bookmark folders (create, rename, delete, list with counts).
 * Separate from {@link BookmarkService} so the bookmark and folder
 * responsibilities each own their aggregates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookmarkFolderService {

    private final BookmarkFolderRepository folderRepository;
    private final BookmarkRepository bookmarkRepository;
    private final BookmarkFolderMapper bookmarkFolderMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<BookmarkFolderDto> getFolders(User user) {
        return folderRepository
                .findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(folder -> bookmarkFolderMapper.toDto(
                        folder,
                        bookmarkRepository.countByFolder(folder)
                ))
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

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BOOKMARK_FOLDER_CREATED,
                user.getId(),
                "bookmarkFolder",
                saved.getId().toString(),
                null
        ));

        log.info(
                "User {} created bookmark folder {}",
                user.getEmail(),
                saved.getName()
        );

        return bookmarkFolderMapper.toDto(saved, 0);
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

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BOOKMARK_FOLDER_RENAMED,
                user.getId(),
                "bookmarkFolder",
                folderId.toString(),
                null
        ));

        log.info(
                "User {} renamed bookmark folder {}",
                user.getEmail(),
                saved.getId()
        );

        return bookmarkFolderMapper.toDto(
                saved,
                bookmarkRepository.countByFolder(saved)
        );
    }

    public void deleteFolder(
            User user,
            UUID folderId
    ) {
        BookmarkFolder folder = getFolder(user, folderId);

        // ON DELETE SET NULL removes the folder_id from its bookmarks
        folderRepository.delete(folder);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                BusinessAuditEvent.Type.BOOKMARK_FOLDER_DELETED,
                user.getId(),
                "bookmarkFolder",
                folderId.toString(),
                null
        ));

        log.info(
                "User {} deleted folder {}",
                user.getEmail(),
                folder.getName()
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
