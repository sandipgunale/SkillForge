package com.project.skillforgebackend.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private UserSummary user;
    private String refreshToken;
    private boolean rememberMe;

    @Data
    @Builder
    public static class UserSummary {
        private String id;
        private String email;
        private String fullName;
        private String role;
    }
}