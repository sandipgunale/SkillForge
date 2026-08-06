package com.project.skillforgebackend.gamification.repository;

import com.project.skillforgebackend.gamification.entity.UserBadge;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface UserBadgeRepository
        extends JpaRepository<UserBadge, UUID> {

    List<UserBadge> findByUserOrderByAwardedAtAsc(User user);

    boolean existsByUserAndCode(User user, String code);

    @Query("select ub.code from UserBadge ub where ub.user = :user")
    Set<String> findCodesByUser(@Param("user") User user);

}
