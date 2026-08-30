package com.project.skillforgebackend.common.audit;

import java.util.UUID;

/**
 * Domain-level audit event for important business actions (quiz lifecycle,
 * ratings, bookmarks, learning paths, badges, catalog/admin mutations).
 *
 * <p>Published synchronously by services; written to the structured audit
 * log by {@link BusinessAuditEventListener}. Never carries sensitive data.
 */
public record BusinessAuditEvent(
        Type type,
        UUID userId,
        String entityType,
        String entityId,
        String detail
) {

    public enum Type {
        QUIZ_GENERATED,
        QUIZ_SUBMITTED,
        LEARNING_PATH_CREATED,
        LEARNING_PATH_UPDATED,
        LEARNING_PATH_COMPLETED,
        LEARNING_PATH_DELETED,
        BOOKMARK_ADDED,
        BOOKMARK_REMOVED,
        BOOKMARK_FOLDER_CREATED,
        BOOKMARK_FOLDER_RENAMED,
        BOOKMARK_FOLDER_DELETED,
        RATING_ADDED,
        RATING_UPDATED,
        RATING_REMOVED,
        BADGE_AWARDED,
        TOPIC_CREATED,
        TOPIC_UPDATED,
        TOPIC_DELETED,
        RESOURCE_CREATED,
        RESOURCE_UPDATED,
        RESOURCE_DELETED,
        COURSE_SECTION_CREATED,
        COURSE_SECTION_UPDATED,
        COURSE_SECTION_DELETED,
        LESSON_COMPLETED,
        ADMIN_USER_UPDATED
    }
}
