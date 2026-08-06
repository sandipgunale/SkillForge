package com.project.skillforgebackend.auth.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(max = 200, message = "Password is too long")
    private String password;

    private boolean rememberMe;
}