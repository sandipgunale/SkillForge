package com.project.skillforgebackend.progress.entity;

import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_progress_user_topic",
                        columnNames = {
                                "user_id",
                                "topic_id"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Progress {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "topic_id",
            nullable = false
    )
    private Topic topic;

    @Column(
            name = "completion_pct",
            nullable = false
    )
    @Builder.Default
    private short completionPercentage = 0;

    @Column(
            name = "minutes_spent",
            nullable = false
    )
    @Builder.Default
    private Integer minutesSpent = 0;

    @Column(
            name = "quizzes_taken",
            nullable = false
    )
    @Builder.Default
    private Integer quizzesTaken = 0;

    @Column(
            name = "avg_score",
            nullable = false,
            precision = 5,
            scale = 2
    )
    @Builder.Default
    private BigDecimal averageScore = BigDecimal.ZERO;

    @Column(
            name = "last_activity_at",
            nullable = false
    )
    private LocalDateTime lastActivityAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.lastActivityAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }

}