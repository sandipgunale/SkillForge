package com.project.skillforgebackend;

import com.project.skillforgebackend.ai.service.AIService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class SkillforgeBackendApplicationTests {

    /**
     * Keeps the AI provider out of the context test so it never
     * performs network calls (quota / availability safe).
     */
    @MockBean
    private AIService aiService;

    @Test
    void contextLoads() {
    }

}
