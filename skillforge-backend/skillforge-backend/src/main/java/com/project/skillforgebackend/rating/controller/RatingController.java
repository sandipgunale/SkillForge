package com.project.skillforgebackend.rating.controller;

import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.rating.dto.RatingRequest;
import com.project.skillforgebackend.rating.dto.RatingResponseDto;
import com.project.skillforgebackend.rating.dto.UserRatingDto;
import com.project.skillforgebackend.rating.service.RatingService;
import com.project.skillforgebackend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    private final CurrentUser currentUser;

    /**
     * Add or update rating.
     */
    @PostMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<RatingResponseDto>> rateResource(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID resourceId,
            @Valid @RequestBody RatingRequest request
    ) {
        User user = currentUser.require(principal);

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
    public ResponseEntity<ApiResponse<UserRatingDto>> getRatingStatus(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID resourceId
    ) {
        User user = currentUser.require(principal);

        UserRatingDto response =
                ratingService.getUserRating(user, resourceId);

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
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable UUID resourceId
    ) {
        User user = currentUser.require(principal);

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