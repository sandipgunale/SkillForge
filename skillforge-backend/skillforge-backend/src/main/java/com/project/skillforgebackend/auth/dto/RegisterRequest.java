package com.project.skillforgebackend.auth.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 200, message = "Password must be 8-200 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must contain uppercase, lowercase, and a number"
    )
    private String password;

    /**
     * Role requested at registration. Only STUDENT (default) and INSTRUCTOR
     * are assignable by self-service; ADMIN is reserved for existing admins
     * (enforced in AuthService, never accepted here).
     */
    private String role;
}
