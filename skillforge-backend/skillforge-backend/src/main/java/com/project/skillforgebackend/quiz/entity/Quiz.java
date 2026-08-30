package com.project.skillforgebackend.quiz.entity;

import com.project.skillforgebackend.learningpath.entity.LearningPath;
import com.project.skillforgebackend.resource.entity.ContentItem;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id")
    private LearningPath learningPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private ContentItem lesson;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QuizSource source = QuizSource.TOPIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Resource.Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QuizStatus status = QuizStatus.IN_PROGRESS;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Builder.Default
    @Column(nullable = false)
    private int score = 0;

    @Builder.Default
    @Column(name = "max_score", nullable = false)
    private int maxScore = 0;

    @OneToMany(
            mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public boolean isExpired() {
        return expiresAt != null
                && LocalDateTime.now().isAfter(expiresAt);
    }

    @PrePersist
    public void onCreate() {
        this.startedAt = LocalDateTime.now();
    }


    @Transient
    public int getDurationMinutes() {

        if (startedAt == null || completedAt == null) {
            return 0;
        }

        return (int) Duration
                .between(
                        startedAt,
                        completedAt
                )
                .toMinutes();

    }

    public enum QuizStatus {
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }
}