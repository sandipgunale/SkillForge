package com.project.skillforgebackend.rating.controller;

import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.rating.dto.RatingRequest;
import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.RatingStatusDto;
import com.project.skillforgebackend.rating.service.RatingService;
import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    /**
     * Add or update rating.
     */
    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<RatingResponseDto>> rateResource(
            @AuthenticationPrincipal User user,
            @PathVariable String resourceId,
            @Valid @RequestBody RatingRequest request
    ) {

        RatingResponseDto response =
                ratingService.rateResource(
                        user,
                        resourceId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Resource rated successfully.",
                        response
                )
        );
    }

    /**
     * Get user's rating.
     */
    @GetMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<RatingStatusDto>> getRatingStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String resourceId
    ) {

        RatingStatusDto response =
                ratingService.getRatingStatus(
                        user,
                        resourceId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Rating status fetched successfully.",
                        response
                )
        );
    }

    /**
     * Remove rating.
     */
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @AuthenticationPrincipal User user,
            @PathVariable String resourceId
    ) {

        ratingService.deleteRating(
                user,
                resourceId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Rating removed successfully.",
                        null
                )
        );
    }

}