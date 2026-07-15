package com.project.skillforgebackend.progress.repository;

import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, UUID> {

    /**
     * Find progress for a specific user and topic.
     */
    Optional<Progress> findByUserAndTopic(
            User user,
            Topic topic
    );

    /**
     * Get all topic progress for a user.
     */
    List<Progress> findByUserOrderByLastActivityAtDesc(
            User user
    );

    /**
     * Check whether a progress record already exists.
     */
    boolean existsByUserAndTopic(
            User user,
            Topic topic
    );


    @Query("""
    SELECT p
    FROM Progress p
    WHERE p.user = :user
    AND p.lastActivityAt >= :fromDate
    ORDER BY p.lastActivityAt ASC
    """)
    List<Progress> findWeeklyProgress(
            User user,
            LocalDateTime fromDate
    );
}