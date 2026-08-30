package com.project.skillforgebackend.resource.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentItem {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentItemType type;

    @Column(length = 500)
    private String url;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private int orderIndex = 0;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private boolean required = true;

    @Column(name = "youtube_video_id", length = 20)
    private String youtubeVideoId;

    @Column(length = 200)
    private String author;

    @Column(length = 20)
    private String isbn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private CourseSection section;

    @Column(name = "free_preview", nullable = false)
    @Builder.Default
    private boolean freePreview = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode materials;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ContentItemType {
        VIDEO, ARTICLE, BOOK, PDF, DOCUMENT, LINK, GITHUB, EXERCISE
    }
}
