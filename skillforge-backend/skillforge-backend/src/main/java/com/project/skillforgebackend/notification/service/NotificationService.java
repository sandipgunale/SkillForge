package com.project.skillforgebackend.notification.service;

import com.project.skillforgebackend.notification.dto.NotificationDto;
import com.project.skillforgebackend.notification.entity.Notification;
import com.project.skillforgebackend.notification.repository.NotificationRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationDto notify(
            User user,
            String type,
            String title,
            String message
    ) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .build();

        Notification saved = notificationRepository.save(notification);

        log.info(
                "Notification '{}' created for {}",
                title,
                user.getEmail()
        );

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(
            User user,
            boolean unreadOnly
    ) {
        List<Notification> notifications = unreadOnly
                ? notificationRepository
                        .findTop50ByUserAndReadFalseOrderByCreatedAtDesc(user)
                : notificationRepository
                        .findTop50ByUserOrderByCreatedAtDesc(user);

        return notifications.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Transactional
    public void markRead(User user, UUID notificationId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new com.project.skillforgebackend.common.exception.ResourceNotFoundException(
                                "Notification",
                                notificationId
                        )
                );

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new com.project.skillforgebackend.common.exception.ResourceNotFoundException(
                    "Notification",
                    notificationId
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllRead(user);
    }

    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId().toString())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

}