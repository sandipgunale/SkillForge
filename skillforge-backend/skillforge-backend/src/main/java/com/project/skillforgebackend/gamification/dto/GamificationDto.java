package com.project.skillforgebackend.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationDto {

    private long points;
    private String level;
    private List<BadgeDto> badges;
    private List<BadgeCatalogDto> catalog;
    private long quizzesCompleted;
    private long bookmarks;
    private long ratings;
    private long learningPathsCompleted;

}