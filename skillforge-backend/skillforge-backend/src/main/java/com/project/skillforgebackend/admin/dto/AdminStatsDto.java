package com.project.skillforgebackend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {

    private long totalUsers;
    private long activeUsers;
    private long totalTopics;
    private long totalResources;
    private long totalQuizzes;
    private long completedQuizzes;
}
