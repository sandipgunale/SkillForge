package com.project.skillforgebackend.notification.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.notification.dto.NotificationDto;
import com.project.skillforgebackend.notification.service.NotificationService;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        User user = currentUser.require(principal);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notifications fetched successfully.",
                        notificationService.getNotifications(user, unreadOnly)
                )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unread count fetched successfully.",
                        Map.of("count", notificationService.getUnreadCount(user))
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID notificationId
    ) {
        User user = currentUser.require(principal);

        notificationService.markRead(user, notificationId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read.",
                        null
                )
        );
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        notificationService.markAllRead(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All notifications marked as read.",
                        null
                )
        );
    }

}