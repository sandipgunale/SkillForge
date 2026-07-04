package com.project.skillforgebackend.rating.repository;

import com.project.skillforgebackend.rating.entity.Rating;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    /**
     * Find rating given by a user for a resource.
     */
    Optional<Rating> findByUserAndResource(
            User user,
            Resource resource
    );

    /**
     * Check whether user has already rated a resource.
     */
    boolean existsByUserAndResource(
            User user,
            Resource resource
    );

    /**
     * Delete user's rating.
     */
    void deleteByUserAndResource(
            User user,
            Resource resource
    );

    /**
     * Count total ratings for a resource.
     */
    long countByResource(
            Resource resource
    );

    /**
     * Calculate average rating of a resource.
     */
    @Query("""
            SELECT AVG(r.value)
            FROM Rating r
            WHERE r.resource = :resource
            """)
    Double calculateAverageRating(
            @Param("resource") Resource resource
    );

}