package com.project.skillforgebackend.learningpathprogress.entity;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "learning_path_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "learning_path_id"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathProgress {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPath learningPath;

    /**
     * Weeks completed by user.
     * Example:
     * [1,2,5]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "completed_weeks_json",
            columnDefinition = "jsonb",
            nullable = false
    )
    @Builder.Default
    private List<Integer> completedWeeks = new ArrayList<>();

    @Column(name = "completion_percentage", nullable = false)
    @Builder.Default
    private Short completionPercentage = 0;

    @Column(name = "quizzes_taken", nullable = false)
    @Builder.Default
    private Integer quizzesTaken = 0;

    @Column(
            name = "average_quiz_score",
            precision = 5,
            scale = 2,
            nullable = false
    )
    @Builder.Default
    private BigDecimal averageQuizScore = BigDecimal.ZERO;

    @Column(name = "minutes_spent", nullable = false)
    @Builder.Default
    private Integer minutesSpent = 0;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
        lastActivityAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

    }

}