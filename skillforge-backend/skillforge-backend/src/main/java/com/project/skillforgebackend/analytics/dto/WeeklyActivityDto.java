package com.project.skillforgebackend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Learning activity of a single day.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyActivityDto {

    /**
     * Day label.
     * Example:
     * Mon
     * Tue
     * Wed
     */
    private String day;

    /**
     * Minutes spent on that day.
     */
    private Integer minutes;

}