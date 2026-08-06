package com.project.skillforgebackend.bookmark.service;

import com.project.skillforgebackend.bookmark.dto.CreateFolderRequest;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.bookmark.mapper.BookmarkFolderMapper;
import com.project.skillforgebackend.bookmark.repository.BookmarkFolderRepository;
import com.project.skillforgebackend.bookmark.repository.BookmarkRepository;
import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookmarkFolderServiceTest {

    @Mock
    private BookmarkFolderRepository folderRepository;

    @Mock
    private BookmarkRepository bookmarkRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private BookmarkFolderService folderService;

    private User user;

    @BeforeEach
    void setUp() {
        folderService = new BookmarkFolderService(
                folderRepository,
                bookmarkRepository,
                new BookmarkFolderMapper(),
                eventPublisher
        );

        user = User.builder()
                .id(UUID.randomUUID())
                .email("student@test.com")
                .fullName("Student")
                .build();

        lenient().when(folderRepository.save(any(BookmarkFolder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createFolder_trimsName_savesAndPublishesEvent() {
        when(folderRepository.existsByUserAndNameIgnoreCase(user, "Java"))
                .thenReturn(false);
        when(folderRepository.save(any(BookmarkFolder.class)))
                .thenAnswer(invocation -> {
                    BookmarkFolder folder = invocation.getArgument(0);
                    folder.setId(UUID.randomUUID());
                    return folder;
                });

        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("  Java  ");

        var dto = folderService.createFolder(user, request);

        assertThat(dto.getName()).isEqualTo("Java");

        ArgumentCaptor<BookmarkFolder> captor =
                ArgumentCaptor.forClass(BookmarkFolder.class);
        verify(folderRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);

        verify(eventPublisher).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void createFolder_rejectsDuplicateName() {
        when(folderRepository.existsByUserAndNameIgnoreCase(user, "Java"))
                .thenReturn(true);

        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("Java");

        assertThatThrownBy(() -> folderService.createFolder(user, request))
                .isInstanceOf(DataIntegrityViolationException.class);

        verify(folderRepository, never()).save(any(BookmarkFolder.class));
    }

    @Test
    void renameFolder_updatesNameAndPublishesEvent() {
        BookmarkFolder folder = BookmarkFolder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Old")
                .build();

        when(folderRepository.findByIdAndUser(folder.getId(), user))
                .thenReturn(java.util.Optional.of(folder));
        when(folderRepository.existsByUserAndNameIgnoreCase(user, "New"))
                .thenReturn(false);

        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("New");

        var dto = folderService.renameFolder(user, folder.getId(), request);

        assertThat(dto.getName()).isEqualTo("New");
        verify(eventPublisher).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void renameFolder_hasSameName_noConflict() {
        BookmarkFolder folder = BookmarkFolder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Java")
                .build();

        when(folderRepository.findByIdAndUser(folder.getId(), user))
                .thenReturn(java.util.Optional.of(folder));
        when(folderRepository.existsByUserAndNameIgnoreCase(user, "Java"))
                .thenReturn(true);

        CreateFolderRequest request = new CreateFolderRequest();
        request.setName("Java");

        var dto = folderService.renameFolder(user, folder.getId(), request);

        // Same name (case-insensitive) is allowed
        assertThat(dto.getName()).isEqualTo("Java");
    }

    @Test
    void deleteFolder_deletesAndPublishesEvent() {
        BookmarkFolder folder = BookmarkFolder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Java")
                .build();

        when(folderRepository.findByIdAndUser(folder.getId(), user))
                .thenReturn(java.util.Optional.of(folder));

        folderService.deleteFolder(user, folder.getId());

        verify(folderRepository).delete(folder);
        verify(eventPublisher).publishEvent(any(BusinessAuditEvent.class));
    }

    @Test
    void deleteFolder_throwsWhenFolderMissing() {
        UUID folderId = UUID.randomUUID();

        when(folderRepository.findByIdAndUser(folderId, user))
                .thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> folderService.deleteFolder(user, folderId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFolders_includesBookmarkCounts() {
        BookmarkFolder folder = BookmarkFolder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Java")
                .build();

        when(folderRepository.findByUserOrderByCreatedAtAsc(user))
                .thenReturn(List.of(folder));
        when(bookmarkRepository.countByFolder(folder)).thenReturn(3L);

        var folders = folderService.getFolders(user);

        assertThat(folders).hasSize(1);
        assertThat(folders.get(0).getBookmarkCount()).isEqualTo(3);
    }
}