package com.project.skillforgebackend.ai.admin;

import com.project.skillforgebackend.ai.client.AiCompletionResult;
import com.project.skillforgebackend.ai.client.AiProviderRegistry;
import com.project.skillforgebackend.ai.dto.AiAdminMetricsDto;
import com.project.skillforgebackend.ai.dto.AiPlaygroundRequest;
import com.project.skillforgebackend.ai.dto.AiPlaygroundResponse;
import com.project.skillforgebackend.ai.guardrail.AiPromptGuard;
import com.project.skillforgebackend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only AI operations ({@code /api/admin/ai/...}, role-guarded by the
 * {@code /api/admin/**} matcher in SecurityConfig): live provider/cache
 * metrics and a prompt playground that runs arbitrary prompts through the
 * real provider chain for debugging and prompt iteration.
 */
@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiAdminController {

    private final AiMetricsService metricsService;

    private final AiProviderRegistry providerRegistry;

    private final AiPromptGuard promptGuard;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AiAdminMetricsDto>> metrics() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "AI metrics fetched successfully.",
                        metricsService.build()
                )
        );
    }

    @PostMapping("/playground")
    public ResponseEntity<ApiResponse<AiPlaygroundResponse>> playground(
            @Valid @RequestBody AiPlaygroundRequest request
    ) {

        promptGuard.guardPromptLength(request.prompt());

        AiCompletionResult result = providerRegistry.complete(request.prompt());

        AiPlaygroundResponse response = new AiPlaygroundResponse(
                result.text(),
                result.provider(),
                result.model(),
                result.latencyMillis(),
                result.promptTokens(),
                result.completionTokens()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Playground completion succeeded.",
                        response
                )
        );
    }
}