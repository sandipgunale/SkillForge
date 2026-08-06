package com.project.skillforgebackend.gamification.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.gamification.dto.GamificationDto;
import com.project.skillforgebackend.gamification.service.GamificationService;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<GamificationDto>> getGamification(
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        User user = currentUser.require(principal);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Gamification stats fetched successfully.",
                        gamificationService.getGamification(user)
                )
        );
    }

}