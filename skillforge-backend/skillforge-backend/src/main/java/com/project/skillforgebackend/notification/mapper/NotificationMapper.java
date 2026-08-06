package com.project.skillforgebackend.notification.mapper;

import com.project.skillforgebackend.notification.dto.NotificationDto;
import com.project.skillforgebackend.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification notification) {
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
