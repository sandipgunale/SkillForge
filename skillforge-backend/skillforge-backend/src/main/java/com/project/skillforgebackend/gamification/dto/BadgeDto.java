package com.project.skillforgebackend.gamification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDto {

    private String code;
    private String name;
    private String description;
    private LocalDateTime awardedAt;

}