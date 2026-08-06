package com.project.skillforgebackend.integration;

import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Authorization matrix against the real security filter chain:
 * public catalog endpoints, authenticated-only endpoints, admin-only
 * endpoints, and the IP-gated metrics endpoint.
 */
class SecurityMatrixIT extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void anonymousAccessMatrix() throws Exception {
        mockMvc.perform(get("/api/v1/topics"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/resources"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/quizzes/history"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/quizzes/active"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
        // /api/v1/topics is public at the filter-chain level; method security
        // (@PreAuthorize) rejects the POST with 403.
        mockMvc.perform(post("/api/v1/topics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"description\":\"X\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(uniqueEmail())))
                .andExpect(status().isCreated());
    }

    @Test
    void metricsEndpointIsGatedByClientIp() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/prometheus")
                        .remoteAddress("10.99.0.7"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentCannotReachAdminEndpoints() throws Exception {
        String token = registerAndLogin(uniqueEmail());

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Blocked Topic","description":"Must be rejected"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreateTopic() throws Exception {
        // Admin is pre-seeded via the repository, so only login (register would 409)
        String token = login(adminUser());

        String name = "Topic-" + UUID.randomUUID().toString().substring(0, 8);
        mockMvc.perform(post("/api/v1/topics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":"Created by an admin"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value(name));
    }

    private String adminUser() {
        String email = uniqueEmail();
        userRepository.save(User.builder()
                .fullName("Admin User")
                .email(email)
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .role(User.Role.ADMIN)
                .isActive(true)
                .build());
        return email;
    }
}
