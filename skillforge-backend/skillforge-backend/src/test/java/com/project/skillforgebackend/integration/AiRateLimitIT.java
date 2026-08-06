package com.project.skillforgebackend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

import java.util.UUID;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AI generation endpoints carry an independent rate limit: with a limit of 1
 * per window, the second generation attempt is rejected with 429. The first
 * call may fail downstream (no real Gemini in CI) but still consumes the
 * permit, so it must NOT be a 429.
 */
@TestPropertySource(properties = {
        "security.rate-limit.ai.enabled=true",
        "security.rate-limit.ai.max-requests=1",
        "security.rate-limit.ai.window-minutes=10"
})
class AiRateLimitIT extends BaseIntegrationTest {

    @Test
    void secondAiGenerationWithinWindowIsRejected() throws Exception {
        String accessToken = registerAndLogin(uniqueEmail());

        String body = """
                {"source":"TOPIC","topicId":"%s","difficulty":"BEGINNER",\
                "questionCount":5,"questionTypes":["MCQ"]}
                """.formatted(UUID.randomUUID());

        mockMvc.perform(post("/api/v1/quizzes")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is(not(429)));

        mockMvc.perform(post("/api/v1/quizzes")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests());
    }
}
