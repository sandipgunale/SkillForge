package com.project.skillforgebackend.bookmark.repository;

import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookmarkFolderRepository
        extends JpaRepository<BookmarkFolder, UUID> {

    List<BookmarkFolder> findByUserOrderByCreatedAtAsc(User user);

    Optional<BookmarkFolder> findByIdAndUser(UUID id, User user);

    boolean existsByUserAndNameIgnoreCase(User user, String name);

    long countByUser(User user);

}