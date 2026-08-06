package com.project.skillforgebackend.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Catalog entry for a badge definition, including the user's
 * current progress toward earning it.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeCatalogDto {

    private String code;
    private String name;
    private String description;
    private boolean earned;
    private long current;
    private long target;
    private LocalDateTime awardedAt;

}
