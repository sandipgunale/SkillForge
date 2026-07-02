package com.project.skillforgebackend.analytics.controller;

import com.project.skillforgebackend.analytics.dto.DashboardDto;
import com.project.skillforgebackend.analytics.service.AnalyticsService;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Returns dashboard analytics of the logged-in user.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard(
            @AuthenticationPrincipal User user
    ) {

        DashboardDto dashboard =
                analyticsService.getDashboard(user);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Dashboard analytics fetched successfully.",
                        dashboard
                )
        );
    }

}