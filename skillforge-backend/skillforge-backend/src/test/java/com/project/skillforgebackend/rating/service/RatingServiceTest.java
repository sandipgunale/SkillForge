package com.project.skillforgebackend.rating.service;

import com.project.skillforgebackend.common.exception.ResourceNotFoundException;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.rating.dto.RatingRequest;
import com.project.skillforgebackend.rating.entity.Rating;
import com.project.skillforgebackend.rating.mapper.RatingMapper;
import com.project.skillforgebackend.rating.repository.RatingRepository;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private GamificationService gamificationService;

    @Spy
    private final RatingMapper ratingMapper = new RatingMapper();

    @InjectMocks
    private RatingService ratingService;

    private User user;
    private Resource resource;
    private UUID resourceId;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("student@test.com")
                .build();

        resourceId = UUID.randomUUID();

        resource = Resource.builder()
                .id(resourceId)
                .title("Java Basics")
                .build();
    }

    @Test
    void rateResource_createsNewRating_whenUserHasNone() {
        when(resourceRepository.findByIdAndActiveTrue(resourceId))
                .thenReturn(Optional.of(resource));
        when(ratingRepository.findByUserAndResource(user, resource))
                .thenReturn(Optional.empty());
        when(ratingRepository.countByResource(resource)).thenReturn(3L);
        when(ratingRepository.calculateAverageRating(resource)).thenReturn(4.0);

        var result = ratingService.rateResource(
                user, resourceId, RatingRequest.builder().value((short) 5).build());

        assertThat(result.getUserRating()).isEqualTo((short) 5);
        verify(ratingRepository).save(any(Rating.class));
        verify(resourceRepository).save(resource);
        assertThat(resource.getAvgRating()).isEqualByComparingTo("4.00");
        assertThat(resource.getRatingCount()).isEqualTo(3);
    }

    @Test
    void rateResource_updatesExistingRating_insteadOfCreatingDuplicate() {
        Rating existing = Rating.builder()
                .id(UUID.randomUUID())
                .user(user)
                .resource(resource)
                .value((short) 2)
                .build();

        when(resourceRepository.findByIdAndActiveTrue(resourceId))
                .thenReturn(Optional.of(resource));
        when(ratingRepository.findByUserAndResource(user, resource))
                .thenReturn(Optional.of(existing));
        when(ratingRepository.countByResource(resource)).thenReturn(1L);
        when(ratingRepository.calculateAverageRating(resource)).thenReturn(3.5);

        var result = ratingService.rateResource(
                user, resourceId, RatingRequest.builder().value((short) 5).build());

        assertThat(result.getUserRating()).isEqualTo((short) 5);
        assertThat(existing.getValue()).isEqualTo((short) 5);
        // One save (update), no second entity created
        verify(ratingRepository, times(1)).save(any(Rating.class));
    }

    @Test
    void rateResource_throwsNotFound_whenResourceInactiveOrMissing() {
        when(resourceRepository.findByIdAndActiveTrue(resourceId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                ratingService.rateResource(
                        user, resourceId, RatingRequest.builder().value((short) 4).build()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(ratingRepository, never()).save(any(Rating.class));
    }

    @Test
    void deleteRating_removesExistingRating_andRecalculatesStats() {
        Rating existing = Rating.builder()
                .id(UUID.randomUUID())
                .user(user)
                .resource(resource)
                .value((short) 4)
                .build();

        when(resourceRepository.findByIdAndActiveTrue(resourceId))
                .thenReturn(Optional.of(resource));
        when(ratingRepository.findByUserAndResource(user, resource))
                .thenReturn(Optional.of(existing));
        when(ratingRepository.countByResource(resource)).thenReturn(0L);
        when(ratingRepository.calculateAverageRating(resource)).thenReturn(null);

        ratingService.deleteRating(user, resourceId);

        verify(ratingRepository).delete(existing);
        assertThat(resource.getAvgRating()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(resource.getRatingCount()).isZero();
    }

    @Test
    void deleteRating_isNoOp_whenUserHasNoRating() {
        when(resourceRepository.findByIdAndActiveTrue(resourceId))
                .thenReturn(Optional.of(resource));
        when(ratingRepository.findByUserAndResource(user, resource))
                .thenReturn(Optional.empty());

        ratingService.deleteRating(user, resourceId);

        verify(ratingRepository, never()).delete(any(Rating.class));
        verify(resourceRepository, never()).save(any(Resource.class));
    }
}
