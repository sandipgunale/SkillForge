package com.project.skillforgebackend.admin.controller;

import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.AiPlaygroundRequest;
import com.project.skillforgebackend.ai.dto.AiPlaygroundResponse;
import com.project.skillforgebackend.ai.metrics.AiMetricsService;
import com.project.skillforgebackend.ai.resilience.AiResilienceExecutor;
import com.project.skillforgebackend.common.response.ApiResponse;
import com.project.skillforgebackend.config.properties.AiServiceProperties;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only AI console: runtime usage metrics and a raw-prompt playground
 * that exercises the full resilience chain (circuit breaker, retry, timeout).
 * Every path lives under {@code /api/admin/**}, which security config already
 * restricts to the ADMIN role.
 */
@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiMetricsService aiMetricsService;
    private final AiResilienceExecutor aiResilienceExecutor;
    private final AiServiceProperties aiServiceProperties;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AiAdminMetricsDto>> getMetrics() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "AI subsystem metrics fetched successfully.",
                        aiMetricsService.metrics()
                )
        );
    }

    @PostMapping("/playground")
    public ResponseEntity<ApiResponse<AiPlaygroundResponse>> playground(
            @Valid @RequestBody AiPlaygroundRequest request) {

        String prompt = request.prompt();

        if (prompt.length() > aiServiceProperties.maxPlaygroundPromptLength()) {
            throw new IllegalArgumentException(
                    "Prompt must not exceed "
                            + aiServiceProperties.maxPlaygroundPromptLength()
                            + " characters."
            );
        }

        var result = aiResilienceExecutor.completeWithMetadata(prompt);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "AI playground request completed.",
                        new AiPlaygroundResponse(
                                result.text(),
                                result.provider(),
                                result.model(),
                                result.promptTokens(),
                                result.completionTokens(),
                                result.latencyMillis()
                        )
                )
        );
    }
}