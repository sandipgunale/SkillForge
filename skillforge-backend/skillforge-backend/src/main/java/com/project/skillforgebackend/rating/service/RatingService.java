package com.project.skillforgebackend.rating.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.rating.dto.RatingRequest;
import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.UserRatingDto;
import com.project.skillforgebackend.rating.entity.Rating;
import com.project.skillforgebackend.rating.mapper.RatingMapper;
import com.project.skillforgebackend.rating.repository.RatingRepository;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Slf4j
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
            UUID resourceId,
            RatingRequest request
    ) {

        Resource resource = resourceRepository
                .findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElseGet(() ->
                        Rating.builder()
                                .user(user)
                                .resource(resource)
                                .build()
                );

        rating.setValue(request.getValue());

        ratingRepository.save(rating);

        updateResourceStatistics(resource);
        log.info(
                "User {} rated resource {} with {} stars",
                user.getEmail(),
                resource.getId(),
                request.getValue()
        );
        return ratingMapper.toResponseDto(rating, resource);
    }

    /**
     * Remove user's rating.
     */
    public void deleteRating(
            User user,
            UUID resourceId
    ) {

        Resource resource = resourceRepository
                .findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rating",
                                resourceId
                        )
                );

        ratingRepository.delete(rating);
        log.info(
                "User {} removed rating for resource {}",
                user.getEmail(),
                resource.getId()
        );

        updateResourceStatistics(resource);
    }

    /**
     * Get user's rating for a resource.
     */
    @Transactional(readOnly = true)
    public UserRatingDto getUserRating(
            User user,
            UUID resourceId
    ) {

        Resource resource = resourceRepository
                .findByIdActive(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElse(null);

        return ratingMapper.toUserRatingDto(rating);
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