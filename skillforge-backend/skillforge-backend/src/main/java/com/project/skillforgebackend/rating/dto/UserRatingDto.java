package com.project.skillforgebackend.rating.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRatingDto {

    /**
     * Has user rated this resource?
     */
    private boolean rated;

    /**
     * User's rating.
     * Null if not rated.
     */
    private Short rating;

}