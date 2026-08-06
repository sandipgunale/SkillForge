package com.project.skillforgebackend.bookmark.repository;

import com.project.skillforgebackend.bookmark.entity.Bookmark;
import com.project.skillforgebackend.bookmark.entity.BookmarkFolder;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    /**
     * Find a bookmark by user and resource.
     * Used to check whether a resource is already bookmarked.
     */
    Optional<Bookmark> findByUserAndResource(
            User user,
            Resource resource
    );

    /**
     * Get all bookmarks of a user ordered by newest first.
     */
    Page<Bookmark> findByUserOrderByCreatedAtDesc(
            User user,
            Pageable pageable
    );

    Page<Bookmark> findByUserAndFolderOrderByCreatedAtDesc(
            User user,
            BookmarkFolder folder,
            Pageable pageable
    );

    Page<Bookmark> findByUserAndFolderIsNullOrderByCreatedAtDesc(
            User user,
            Pageable pageable
    );

    long countByUser(User user);

    long countByFolder(BookmarkFolder folder);

    /**
     * Check whether the user has already bookmarked the resource.
     */
    boolean existsByUserAndResource(
            User user,
            Resource resource
    );

}