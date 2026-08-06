package com.project.skillforgebackend.admin.controller;

import com.project.skillforgebackend.admin.dto.AdminStatsDto;
import com.project.skillforgebackend.admin.service.AdminStatsService;
import com.project.skillforgebackend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Admin stats fetched successfully.",
                        adminStatsService.getStats()
                )
        );
    }
}