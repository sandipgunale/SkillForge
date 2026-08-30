package com.project.skillforgebackend.resource.repository;

import com.project.skillforgebackend.resource.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, UUID> {

    Optional<LessonCompletion> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    List<LessonCompletion> findByUserIdAndLessonIdIn(UUID userId, List<UUID> lessonIds);

    long countByUserIdAndLessonIdInAndCompletedTrue(UUID userId, List<UUID> lessonIds);

    @Query("select distinct l.lesson.resource.id from LessonCompletion l where l.user.id = :userId")
    List<UUID> findDistinctCourseIdsByUserId(@Param("userId") UUID userId);
}
