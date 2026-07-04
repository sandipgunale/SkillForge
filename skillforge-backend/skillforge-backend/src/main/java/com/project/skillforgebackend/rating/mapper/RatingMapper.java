package com.project.skillforgebackend.rating.mapper;

import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.RatingStatusDto;
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

        if (rating == null || resource == null) {
            return null;
        }

        return RatingResponseDto.builder()
                .resourceId(resource.getId().toString())
                .userRating(rating.getValue())
                .averageRating(resource.getAvgRating())
                .ratingCount(resource.getRatingCount())
                .build();
    }

    /**
     * Converts Rating entity to RatingStatusDto.
     */
    public RatingStatusDto toStatusDto(
            Rating rating
    ) {

        if (rating == null) {

            return RatingStatusDto.builder()
                    .rated(false)
                    .rating(null)
                    .build();
        }

        return RatingStatusDto.builder()
                .rated(true)
                .rating(rating.getValue())
                .build();
    }

}