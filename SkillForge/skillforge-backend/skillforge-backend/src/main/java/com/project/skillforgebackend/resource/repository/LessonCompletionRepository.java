package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, UUID> {

    Optional<LessonCompletion> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    List<LessonCompletion> findByUserIdAndLessonIdIn(UUID userId, List<UUID> lessonIds);

    long countByUserIdAndLessonIdInAndCompletedTrue(UUID userId, List<UUID> lessonIds);
}
