package com.project.skillforgebackend.learningpathprogress.repository;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.learningpathprogress.entity.LearningPathProgress;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningPathProgressRepository extends JpaRepository<LearningPathProgress, UUID> {

    @Query("""
    SELECT p
    FROM LearningPathProgress p
    JOIN FETCH p.learningPath
    WHERE p.user = :user
      AND p.learningPath = :learningPath
""")
    Optional<LearningPathProgress> findByUserAndLearningPath(
            @Param("user") User user,
            @Param("learningPath") LearningPath learningPath
    );

    @Query("""
    SELECT p
    FROM LearningPathProgress p
    JOIN FETCH p.learningPath
    WHERE p.user = :user
""")
    List<LearningPathProgress> findByUser(@Param("user") User user);

}