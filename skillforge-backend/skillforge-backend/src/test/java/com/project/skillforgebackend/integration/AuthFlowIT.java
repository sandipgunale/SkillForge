package com.project.skillforgebackend.integration;

import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end auth flow against a real PostgreSQL (Flyway-migrated):
 * register -> login -> authenticated profile fetch, plus the rejection
 * paths (duplicate email, weak password, wrong password).
 */
class AuthFlowIT extends BaseIntegrationTest {

    @Test
    void registerThenLoginThenFetchProfile() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(registerBody(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(header().string("Set-Cookie", containsString("refreshToken=")))
                .andReturn().getResponse().getContentAsString();

        String accessToken = objectMapper.readTree(response)
                .at("/accessToken").asText();

        // /api/users/me returns the UserDto directly (no ApiResponse envelope)
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Integration User"));
    }

    @Test
    void duplicateRegistrationReturnsConflict() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(registerBody(email)))
                .andExpect(status().isConflict());
    }

    @Test
    void weakPasswordIsRejected() throws Exception {
        String body = """
                {"fullName":"Weak User","email":"%s","password":"short"}
                """.formatted(uniqueEmail());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("""
                                {"email":"%s","password":"WrongPass999"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized());
    }
}
