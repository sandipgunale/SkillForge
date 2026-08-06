package com.project.skillforgebackend.notification.repository;

import com.project.skillforgebackend.notification.entity.Notification;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    List<Notification> findTop50ByUserOrderByCreatedAtDesc(User user);

    List<Notification> findTop50ByUserAndReadFalseOrderByCreatedAtDesc(
            User user
    );

    long countByUserAndReadFalse(User user);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true "
            + "WHERE n.user = :user")
    void markAllRead(@Param("user") User user);

}
