package com.project.skillforgebackend.quiz.repository;

import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    /**
     * Find quiz by quiz id and owner.
     * Used while submitting quiz.
     */
    Optional<Quiz> findByIdAndUser(UUID id, User user);

    /**
     * User Quiz History
     */
    Page<Quiz> findByUserOrderByStartedAtDesc(User user, Pageable pageable);

    /**
     * Count completed quizzes of a topic.
     * Useful for analytics.
     */
    long countByUserAndTopic(User user, Topic topic);

    /**
     * Total completed quizzes.
     */
    long countByUser(User user);

    /**
     * Recent completed quizzes.
     */
    Page<Quiz> findByUserAndStatusOrderByCompletedAtDesc(
            User user,
            Quiz.QuizStatus status,
            Pageable pageable
    );

}