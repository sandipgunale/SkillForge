package com.project.skillforgebackend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration harness: real PostgreSQL via Testcontainers
 * (Flyway migrations run against it), MockMvc through the real
 * SecurityFilterChain. Requires a running Docker daemon; tests are
 * skipped by Testcontainers when it is unavailable.
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureObservability
@Testcontainers(disabledWithoutDocker = true)
public abstract class BaseIntegrationTest {

    private static final String JWT_SECRET = Base64.getEncoder().encodeToString(
            "skillforge-it-secret-0123456789abcdef0123456789abcdef"
                    .getBytes(StandardCharsets.UTF_8)
    );

    /**
     * Started once at class-load time and never stopped per test class:
     * the Spring context is cached across integration test classes, so a
     * per-class start/stop would kill the database the cached context
     * still points at.
     */
    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void containerProperties(DynamicPropertyRegistry registry) {
        registry.add("DB_URL", POSTGRES::getJdbcUrl);
        registry.add("DB_USERNAME", POSTGRES::getUsername);
        registry.add("DB_PASSWORD", POSTGRES::getPassword);
        registry.add("JWT_SECRET", () -> JWT_SECRET);
        registry.add("gemini.api-key", () -> "it-key");
        registry.add("gemini.models", () -> "test-model");
        registry.add("security.rate-limit.enabled", () -> "false");
        registry.add("app.monitoring.allowed-ips", () -> "127.0.0.1");
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected static final String PASSWORD = "Str0ngPass123";

    protected String uniqueEmail() {
        return "it-" + UUID.randomUUID() + "@test.local";
    }

    protected String registerBody(String email) {
        return """
                {"fullName":"Integration User","email":"%s","password":"%s"}
                """.formatted(email, PASSWORD);
    }

    protected String loginBody(String email) {
        return """
                {"email":"%s","password":"%s"}
                """.formatted(email, PASSWORD);
    }

    protected String registerAndLogin(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        return login(email);
    }

    protected String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // AuthResponse is returned at the top level (no ApiResponse envelope)
        return objectMapper.readTree(response).at("/accessToken").asText();
    }
}
