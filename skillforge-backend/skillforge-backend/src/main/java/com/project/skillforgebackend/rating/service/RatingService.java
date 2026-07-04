package com.project.skillforgebackend.rating.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.rating.dto.RatingRequest;
import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.RatingStatusDto;
import com.project.skillforgebackend.rating.entity.Rating;
import com.project.skillforgebackend.rating.mapper.RatingMapper;
import com.project.skillforgebackend.rating.repository.RatingRepository;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ResourceRepository resourceRepository;
    private final RatingMapper ratingMapper;

    /**
     * Add or update a rating.
     */
    public RatingResponseDto rateResource(
            User user,
            String resourceId,
            RatingRequest request
    ) {

        Resource resource = resourceRepository
                .findByIdActive(java.util.UUID.fromString(resourceId))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElse(
                        Rating.builder()
                                .user(user)
                                .resource(resource)
                                .build()
                );

        rating.setValue(request.getValue());

        ratingRepository.save(rating);

        updateResourceStatistics(resource);

        return ratingMapper.toResponseDto(rating, resource);
    }

    /**
     * Remove user's rating.
     */
    public void deleteRating(
            User user,
            String resourceId
    ) {

        Resource resource = resourceRepository
                .findByIdActive(java.util.UUID.fromString(resourceId))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Rating not found."
                        )
                );

        ratingRepository.delete(rating);

        updateResourceStatistics(resource);
    }

    /**
     * Get user's rating for a resource.
     */
    @Transactional(readOnly = true)
    public RatingStatusDto getRatingStatus(
            User user,
            String resourceId
    ) {

        Resource resource = resourceRepository
                .findByIdActive(java.util.UUID.fromString(resourceId))
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElse(null);

        return ratingMapper.toStatusDto(rating);
    }

    /**
     * Recalculate average rating and rating count.
     */
    private void updateResourceStatistics(
            Resource resource
    ) {

        long ratingCount =
                ratingRepository.countByResource(resource);

        Double average =
                ratingRepository.calculateAverageRating(resource);

        resource.setRatingCount((int) ratingCount);

        if (average == null) {

            resource.setAvgRating(BigDecimal.ZERO);

        } else {

            resource.setAvgRating(
                    BigDecimal.valueOf(average)
                            .setScale(2, RoundingMode.HALF_UP)
            );
        }

        resourceRepository.save(resource);
    }

}