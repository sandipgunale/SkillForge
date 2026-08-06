package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Tag;
import com.project.skillforgebackend.resource.entity.Topic;
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
SELECT DISTINCT r
FROM Resource r
LEFT JOIN FETCH r.topic
LEFT JOIN FETCH r.tags
WHERE r.active = true
AND (:topicId IS NULL OR r.topic.id = :topicId)
AND (:difficulty IS NULL OR r.difficulty = :difficulty)
AND (:type IS NULL OR r.type = :type)
AND (
    :search IS NULL
    OR LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    OR LOWER(r.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    OR LOWER(r.topic.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    OR EXISTS (
        SELECT t
        FROM r.tags t
        WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    )
)
""")
    Page<Resource> findAllWithFilters(
            UUID topicId,
            Resource.Difficulty difficulty,
            Resource.ResourceType type,
            String search,
            Pageable pageable
    );

    Optional<Resource> findByIdAndActiveTrue(UUID id);

    boolean existsByTopic(Topic topic);

    boolean existsByTagsContaining(Tag tag);
}