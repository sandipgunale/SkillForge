package com.project.skillforgebackend.quiz.entity;

import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

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

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void onCreate() {
        this.startedAt = LocalDateTime.now();
    }

    public enum QuizStatus {
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }
}