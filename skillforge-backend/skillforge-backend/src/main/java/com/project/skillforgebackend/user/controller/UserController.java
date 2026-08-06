package com.project.skillforgebackend.user.controller;



import com.project.skillforgebackend.auth.principal.AuthenticatedPrincipal;
import com.project.skillforgebackend.auth.principal.CurrentUser;
import com.project.skillforgebackend.user.dto.*;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final CurrentUser currentUser;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(
            @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        User user = currentUser.require(principal);
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUser.require(principal);
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }
}