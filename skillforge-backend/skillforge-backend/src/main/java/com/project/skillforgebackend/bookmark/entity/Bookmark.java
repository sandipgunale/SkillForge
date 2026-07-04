package com.project.skillforgebackend.bookmark.entity;

import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "bookmarks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bookmark_user_resource",
                        columnNames = {
                                "user_id",
                                "resource_id"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    @UuidGenerator
    private UUID id;

    /**
     * User who bookmarked the resource.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    /**
     * Bookmarked learning resource.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "resource_id",
            nullable = false
    )
    private Resource resource;

    /**
     * Bookmark creation timestamp.
     */
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}