package com.project.skillforgebackend.quiz.repository;

import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID>, JpaSpecificationExecutor<Quiz> {

    /**
     * Find quiz by quiz id and owner.
     * Used while submitting quiz.
     */
    @EntityGraph(attributePaths = {"topic", "learningPath", "questions"})
    Optional<Quiz> findByIdAndUser(UUID id, User user);

    /**
     * User Quiz History
     */
    @EntityGraph(attributePaths = {"topic", "learningPath", "questions"})
    Page<Quiz> findByUserOrderByStartedAtDesc(User user, Pageable pageable);

    /**
     * History with filters. {@link QuizMapper#toDto} reads the LAZY
     * topic / learning path / questions on every row — fetched eagerly
     * here to avoid an N+1 query per quiz in the history list.
     */
    @EntityGraph(attributePaths = {"topic", "learningPath", "questions"})
    @Override
    Page<Quiz> findAll(Specification<Quiz> spec, Pageable pageable);

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
    @EntityGraph(attributePaths = {"topic", "learningPath", "questions"})
    Page<Quiz> findByUserAndStatusOrderByCompletedAtDesc(
            User user,
            Quiz.QuizStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"topic", "learningPath", "questions"})
    List<Quiz> findTop10ByUserAndStatusOrderByCompletedAtDesc(
            User user,
            Quiz.QuizStatus status
    );

    long countByUserAndStatus(
            User user,
            Quiz.QuizStatus status
    );

    long countByStatus(
            Quiz.QuizStatus status
    );

    @EntityGraph(attributePaths = {"topic", "learningPath", "lesson", "questions"})
    Optional<Quiz> findTopByUserAndStatusOrderByStartedAtDesc(
            User user,
            Quiz.QuizStatus status
    );

    /**
     * Latest quiz generated for a specific course lesson by the given user.
     * Used by the lesson workspace to surface an existing practice quiz.
     */
    @EntityGraph(attributePaths = {"topic", "learningPath", "lesson", "questions"})
    Optional<Quiz> findTopByUserAndLesson_IdOrderByStartedAtDesc(
            User user,
            UUID lessonId
    );

    @Query("""
            SELECT COUNT(q) > 0
            FROM Quiz q
            WHERE q.user = :user
              AND q.status = :status
              AND q.maxScore > 0
              AND q.score = q.maxScore
            """)
    boolean existsPerfectScore(
            @Param("user") User user,
            @Param("status") Quiz.QuizStatus status
    );

    long countByUserAndStatusAndCompletedAtAfter(
            User user,
            Quiz.QuizStatus status,
            java.time.LocalDateTime completedAtAfter
    );

    void deleteByLearningPath(
            com.project.skillforgebackend.learningpath.entity.LearningPath learningPath
    );

}