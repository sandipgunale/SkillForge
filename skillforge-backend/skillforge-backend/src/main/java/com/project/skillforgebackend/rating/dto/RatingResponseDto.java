package com.project.skillforgebackend.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponseDto {

    /**
     * Resource Information
     */
    private String resourceId;

    /**
     * User Rating
     */
    private Short userRating;

    /**
     * Overall Resource Rating
     */
    private BigDecimal averageRating;

    /**
     * Total number of ratings
     */
    private Integer ratingCount;

}