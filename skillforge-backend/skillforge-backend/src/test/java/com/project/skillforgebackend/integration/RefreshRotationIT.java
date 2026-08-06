package com.project.skillforgebackend.integration;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Refresh-token rotation against the real store (Postgres + V20 migration):
 * each refresh mints a successor and revokes the presented token; reusing a
 * rotated token is rejected (family revocation).
 */
class RefreshRotationIT extends BaseIntegrationTest {

    @Test
    void rotatedRefreshTokenCanBeUsedOnce() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        Cookie first = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie",
                        org.hamcrest.Matchers.containsString("refreshToken=")))
                .andReturn().getResponse().getCookie("refreshToken");
        assertNotNull(first, "login must set a refresh token cookie");

        // First refresh with the login-issued token: succeeds, rotates.
        Cookie second = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", first.getValue())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn().getResponse().getCookie("refreshToken");
        assertNotNull(second, "refresh must mint a successor cookie");
        assertNotEquals(first.getValue(), second.getValue(),
                "successor token must differ from the presented token");

        // Replaying the rotated token is rejected, and the whole family is
        // revoked (OWASP reuse detection): the successor is dead too.
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", first.getValue())))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", second.getValue())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void expiredOrUnknownRefreshTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("refreshToken", "totally-bogus-token")))
                .andExpect(status().isUnauthorized());
    }
}
