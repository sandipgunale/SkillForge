package com.project.skillforgebackend.admin.controller;

import com.project.skillforgebackend.ai.client.AiCompletionResult;
import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.AiModelMetricDto;
import com.project.skillforgebackend.ai.metrics.AiMetricsService;
import com.project.skillforgebackend.ai.resilience.AiResilienceExecutor;
import com.project.skillforgebackend.common.exception.GlobalExceptionHandler;
import com.project.skillforgebackend.config.properties.AiServiceProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AiAdminControllerTest {

    private MockMvc mockMvc;
    private AiMetricsService metricsService;

    @BeforeEach
    void setUp() {
        metricsService = mock(AiMetricsService.class);
        AiResilienceExecutor resilienceExecutor = mock(AiResilienceExecutor.class);

        when(resilienceExecutor.completeWithMetadata(anyString()))
                .thenReturn(new AiCompletionResult(
                        "Admin says hello",
                        "gemini-2.5",
                        "gemini",
                        12,
                        4,
                        42L
                ));

        AiAdminController controller = new AiAdminController(
                metricsService,
                resilienceExecutor,
                new AiServiceProperties(true, 300, 50000, 50, 20000)
        );

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void metricsReturnsAggregate() throws Exception {
        when(metricsService.metrics()).thenReturn(new AiAdminMetricsDto(
                "CLOSED",
                0.0f,
                7,
                6,
                1,
                List.of(new AiModelMetricDto(
                        "gemini", "gemini-2.5", 6, 1, 350.0, 500, 200
                )),
                2,
                1,
                1
        ));

        mockMvc.perform(get("/api/admin/ai/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalCalls").value(7))
                .andExpect(jsonPath("$.data.circuitBreakerState").value("CLOSED"))
                .andExpect(jsonPath("$.data.models[0].model").value("gemini-2.5"));
    }

    @Test
    void playgroundRunsCompletion() throws Exception {
        mockMvc.perform(post("/api/admin/ai/playground")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"Write a haiku\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completion").value("Admin says hello"))
                .andExpect(jsonPath("$.data.model").value("gemini-2.5"))
                .andExpect(jsonPath("$.data.provider").value("gemini"))
                .andExpect(jsonPath("$.data.promptTokens").value(12));
    }

    @Test
    void playgroundRejectsBlankPrompt() throws Exception {
        mockMvc.perform(post("/api/admin/ai/playground")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void playgroundRejectsOversizedPrompt() throws Exception {
        String longPrompt = "a".repeat(20001);

        mockMvc.perform(post("/api/admin/ai/playground")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"" + longPrompt + "\"}"))
                .andExpect(status().isBadRequest());
    }
}