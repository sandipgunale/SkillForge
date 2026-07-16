package com.project.skillforgebackend.rating.mapper;

import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.UserRatingDto;
import com.project.skillforgebackend.rating.entity.Rating;
import com.project.skillforgebackend.resource.entity.Resource;
import org.springframework.stereotype.Component;

@Component
public class RatingMapper {

    /**
     * Converts Rating entity to RatingResponseDto.
     */
    public RatingResponseDto toResponseDto(
            Rating rating,
            Resource resource
    ) {

        if (rating == null) {
            return null;
        }

        return RatingResponseDto.builder()
                .resourceId(resource.getId())
                .userRating(rating.getValue())
                .averageRating(resource.getAvgRating())
                .ratingCount(resource.getRatingCount())
                .build();
    }

    /**
     * Converts Rating entity to RatingStatusDto.
     */
    public UserRatingDto toUserRatingDto(
            Rating rating
    ) {

        if (rating == null) {

            return UserRatingDto.builder()
                    .rated(false)
                    .rating(null)
                    .build();
        }

        return UserRatingDto.builder()
                .rated(true)
                .rating(rating.getValue())
                .build();
    }

}