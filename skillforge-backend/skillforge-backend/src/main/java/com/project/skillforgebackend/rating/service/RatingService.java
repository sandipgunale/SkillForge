package com.project.skillforgebackend.rating.service;

import com.project.skillforgebackend.common.audit.BusinessAuditEvent;
import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
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
    private final GamificationService gamificationService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Add or update a rating.
     */
    @CacheEvict(cacheNames = "resources", allEntries = true)
    public RatingResponseDto rateResource(
            User user,
            UUID resourceId,
            RatingRequest request
    ) {

        Resource resource =
                getResource(resourceId);

        Rating rating = ratingRepository
                .findByUserAndResource(user, resource)
                .orElseGet(() ->
                        Rating.builder()
                                .user(user)
                                .resource(resource)
                                .build()
                );

        boolean isNew = rating.getId() == null;

        rating.setValue(request.getValue());

        ratingRepository.save(rating);

        updateResourceStatistics(resource);

        gamificationService.checkAndAwardBadges(user);

        eventPublisher.publishEvent(new BusinessAuditEvent(
                isNew
                        ? BusinessAuditEvent.Type.RATING_ADDED
                        : BusinessAuditEvent.Type.RATING_UPDATED,
                user.getId(),
                "resource",
                resourceId.toString(),
                request.getValue() + " stars"
        ));

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
    @CacheEvict(cacheNames = "resources", allEntries = true)
    public void deleteRating(
            User user,
            UUID resourceId
    ) {

        Resource resource =
                getResource(resourceId);

        ratingRepository.findByUserAndResource(user, resource)
                .ifPresent(rating -> {
                    ratingRepository.delete(rating);

                    updateResourceStatistics(resource);

                    eventPublisher.publishEvent(new BusinessAuditEvent(
                            BusinessAuditEvent.Type.RATING_REMOVED,
                            user.getId(),
                            "resource",
                            resourceId.toString(),
                            null
                    ));

                    log.info(
                            "User {} removed rating for resource {}",
                            user.getEmail(),
                            resource.getId()
                    );
                });
    }

    /**
     * Get user's rating for a resource.
     */
    @Transactional(readOnly = true)
    public UserRatingDto getUserRating(
            User user,
            UUID resourceId
    ) {

        Resource resource =
                getResource(resourceId);

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

    private Resource getResource(
            UUID resourceId
    ) {

        return resourceRepository
                .findByIdAndActiveTrue(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource",
                                resourceId
                        )
                );

    }

}