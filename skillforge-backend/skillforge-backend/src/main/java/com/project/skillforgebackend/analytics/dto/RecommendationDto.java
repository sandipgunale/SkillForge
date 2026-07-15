package com.project.skillforgebackend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.project.skillforgebackend.analytics.enums.RecommendationPriority;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDto {

    /**
     * Recommendation title
     */
    private String title;

    /**
     * Why this recommendation exists
     */
    private String reason;

    /**
     * LOW | MEDIUM | HIGH
     */
    private RecommendationPriority priority;

}