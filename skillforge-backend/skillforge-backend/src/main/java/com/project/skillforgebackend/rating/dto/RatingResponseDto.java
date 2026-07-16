package com.project.skillforgebackend.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponseDto {

    /**
     * Resource Information
     */
    private UUID resourceId;

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