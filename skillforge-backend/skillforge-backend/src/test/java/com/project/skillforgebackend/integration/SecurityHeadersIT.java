package com.project.skillforgebackend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security headers emitted by the real filter chain on every response:
 * CSP, HSTS, framing/clickjacking, cross-origin isolation, legacy plugins.
 */
class SecurityHeadersIT extends BaseIntegrationTest {

    @Test
    void responseCarriesSecurityHardeningHeaders() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .secure(true)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                // CSP with browser-relevant directives
                .andExpect(header().string("Content-Security-Policy",
                        containsString("default-src 'self'")))
                .andExpect(header().string("Content-Security-Policy",
                        containsString("frame-ancestors 'none'")))
                // HSTS enabled by default config
                .andExpect(header().string("Strict-Transport-Security",
                        containsString("max-age=31536000")))
                // Clickjacking / content sniffing
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy",
                        containsString("strict-origin-when-cross-origin")))
                .andExpect(header().string("Permissions-Policy",
                        containsString("camera=()")))
                // Cross-origin isolation
                .andExpect(header().string("Cross-Origin-Opener-Policy", "same-origin"))
                .andExpect(header().string("Cross-Origin-Embedder-Policy", "require-corp"))
                .andExpect(header().string("Cross-Origin-Resource-Policy", "same-origin"))
                // Legacy plugin framing policy
                .andExpect(header().string("X-Permitted-Cross-Domain-Policies", "none"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void refreshCookieIsHttpOnlyAndSameSiteLax() throws Exception {
        String email = uniqueEmail();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email)))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("refreshToken=")))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=LAX")))
                .andExpect(header().string("Set-Cookie", containsString("Path=/api/auth")));
    }
}
