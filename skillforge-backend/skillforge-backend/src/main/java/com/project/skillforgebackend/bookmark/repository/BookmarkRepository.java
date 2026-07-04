package com.project.skillforgebackend.bookmark.repository;

import com.project.skillforgebackend.bookmark.entity.Bookmark;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
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
    List<Bookmark> findByUserOrderByCreatedAtDesc(
            User user
    );

    /**
     * Check whether the user has already bookmarked the resource.
     */
    boolean existsByUserAndResource(
            User user,
            Resource resource
    );

    /**
     * Count total bookmarks of a user.
     * Used by Analytics Dashboard.
     */
    long countByUser(
            User user
    );

    /**
     * Remove a bookmark.
     */
    void deleteByUserAndResource(
            User user,
            Resource resource
    );

}