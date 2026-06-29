package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("""
        SELECT r
        FROM Resource r
        JOIN FETCH r.topic
        WHERE r.isActive = true
          AND (:topicId IS NULL OR r.topic.id = :topicId)
          AND (:difficulty IS NULL OR r.difficulty = :difficulty)
          AND (:type IS NULL OR r.type = :type)
          AND (
                :search IS NULL
                OR :search = ''
                OR LOWER(r.title) LIKE CONCAT('%', LOWER(CAST(:search AS string)), '%')
          )
        ORDER BY r.createdAt DESC
    """)
    Page<Resource> findAllWithFilters(
            @Param("topicId") UUID topicId,
            @Param("difficulty") Resource.Difficulty difficulty,
            @Param("type") Resource.ResourceType type,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT r
        FROM Resource r
        JOIN FETCH r.topic
        LEFT JOIN FETCH r.tags
        WHERE r.id = :id
          AND r.isActive = true
    """)
    Optional<Resource> findByIdActive(@Param("id") UUID id);
}