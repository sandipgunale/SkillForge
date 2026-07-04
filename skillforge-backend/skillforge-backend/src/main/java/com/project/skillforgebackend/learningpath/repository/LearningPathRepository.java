package com.project.skillforgebackend.learningpath.repository;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpath.enums.LearningPathStatus;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningPathRepository
        extends JpaRepository<LearningPath, UUID> {

    /**
     * Get all learning paths of a user.
     */
    List<LearningPath> findByUserOrderByCreatedAtDesc(
            User user
    );

    /**
     * Get learning paths by status.
     */
    List<LearningPath> findByUserAndStatusOrderByCreatedAtDesc(
            User user,
            LearningPathStatus status
    );

    /**
     * Get one learning path owned by the user.
     */
    Optional<LearningPath> findByIdAndUser(
            UUID id,
            User user
    );

    /**
     * Check ownership.
     */
    boolean existsByIdAndUser(
            UUID id,
            User user
    );
}