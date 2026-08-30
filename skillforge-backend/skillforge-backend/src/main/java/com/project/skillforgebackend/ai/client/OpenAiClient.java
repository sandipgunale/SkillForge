package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.config.properties.OpenAiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * OpenAI Chat Completions provider.
 *
 * <p>Used as the secondary entry in {@link AiProviderRegistry}: when Gemini is
 * rate-limited (HTTP 429) or returning transient 5xx overload, the registry
 * fails over to this client so quiz / evaluation / learning-path generation
 * still succeeds. The contract is identical to {@link GeminiClient} — callers
 * observe a single {@link AiCompletionResult} regardless of which vendor
 * answered.
 *
 * <p>Resilience mirrors {@link GeminiClient}: on HTTP 429 or 5xx the client
 * rotates to the next configured model and retries with backoff; transport
 * failures (DNS / connection refused) are retried the same way.
 */
@Component
@Order(2)
@Slf4j
public class OpenAiClient implements AiProvider {

    private final RestClient restClient;

    private final String apiKey;

    private final List<String> models;

    private final double temperature;

    private final int retryDelayMaxSeconds;

    private final int transportRetrySleepSeconds;

    private int modelIndex = 0;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenAiClient(OpenAiProperties properties) {

        this.apiKey = properties.apiKey();

        this.models = properties.models() == null || properties.models().isEmpty()
                ? List.of("gpt-4o-mini")
                : properties.models();

        this.temperature = properties.temperature() == null
                ? 0.7
                : properties.temperature();

        this.retryDelayMaxSeconds = properties.retryDelayMaxSeconds() == null
                ? 45
                : properties.retryDelayMaxSeconds();

        this.transportRetrySleepSeconds = properties.transportRetrySleepSeconds() == null
                ? 2
                : properties.transportRetrySleepSeconds();

        String baseUrl = properties.baseUrl() == null || properties.baseUrl().isBlank()
                ? "https://api.openai.com/v1"
                : properties.baseUrl();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.connectTimeoutMs() == null ? 15000 : properties.connectTimeoutMs());
        factory.setReadTimeout(properties.readTimeoutMs() == null ? 60000 : properties.readTimeoutMs());

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .requestFactory(factory)
                .build();
    }

    private synchronized String currentModel() {
        return models.get(modelIndex);
    }

    private synchronized void advanceModel() {
        modelIndex = (modelIndex + 1) % models.size();
        log.warn("Switching OpenAI model to {}", models.get(modelIndex));
    }

    @Override
    public String providerName() {
        return "openai";
    }

    @Override
    public String complete(String prompt) {
        return completeWithMetadata(prompt).text();
    }

    @Override
    public AiCompletionResult completeWithMetadata(String prompt) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new AIServiceException("OpenAI not configured (openai.api-key is blank).");
        }

        Map<String, Object> messages = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> request = Map.of(
                "model", currentModel(),
                "temperature", temperature,
                "messages", List.of(messages)
        );

        long startedAt = System.nanoTime();

        int attempts = models.size();

        HttpStatusCodeException lastHttpError = null;
        ResourceAccessException lastTransportError = null;

        for (int attempt = 0; attempt < attempts; attempt++) {

            String model = currentModel();

            try {

                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.post()
                        .uri("/chat/completions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(request)
                        .retrieve()
                        .body(Map.class);

                if (response == null) {
                    throw new AIServiceException("Empty response received from OpenAI.");
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) response.get("choices");

                if (choices == null || choices.isEmpty()) {
                    throw new AIServiceException("No choices returned by OpenAI.");
                }

                @SuppressWarnings("unchecked")
                Map<String, Object> message =
                        (Map<String, Object>) choices.get(0).get("message");

                Object text = message == null ? null : message.get("content");

                if (text == null || text.toString().isBlank()) {
                    throw new AIServiceException("OpenAI returned empty content.");
                }

                log.info("OpenAI response received from model {}.", model);

                return new AiCompletionResult(
                        text.toString().trim(),
                        model,
                        providerName(),
                        usageTokens(response, "prompt_tokens"),
                        usageTokens(response, "completion_tokens"),
                        (System.nanoTime() - startedAt) / 1_000_000L
                );

            } catch (HttpStatusCodeException ex) {

                int status = ex.getStatusCode().value();

                log.error(
                        "OpenAI HTTP Status : {} (model {})",
                        ex.getStatusCode(),
                        model
                );
                log.error("OpenAI Response : {}", extractErrorMessage(ex.getResponseBodyAsString()));

                if (status == 429 || (status >= 500 && status <= 599)) {

                    lastHttpError = ex;

                    log.warn(
                            "OpenAI model {} returned HTTP {} (transient); "
                                    + "rotating to the next model and retrying.",
                            model,
                            status
                    );

                    sleepBeforeRetry(extractRetryDelaySeconds(ex.getResponseBodyAsString()));
                    advanceModel();
                    continue;
                }

                throw new AIServiceException(
                        "OpenAI API Error ("
                                + status
                                + "): "
                                + extractErrorMessage(ex.getResponseBodyAsString()),
                        ex
                );

            } catch (AIServiceException ex) {

                throw ex;

            } catch (ResourceAccessException ex) {

                log.error("Failed to reach OpenAI (model {}): {}", model, ex.getMessage());
                lastTransportError = ex;
                sleepBeforeRetry(transportRetrySleepSeconds);
                advanceModel();

            } catch (Exception ex) {

                log.error("Unexpected OpenAI error.", ex);
                throw new AIServiceException("Failed to communicate with OpenAI.", ex);
            }
        }

        if (lastHttpError != null) {
            throw new AIServiceException(
                    "OpenAI was unavailable on all configured models ("
                            + String.join(", ", models)
                            + "). "
                            + extractErrorMessage(lastHttpError.getResponseBodyAsString()),
                    lastHttpError
            );
        }

        throw new AIServiceException(
                "Unable to reach OpenAI on all models ("
                        + String.join(", ", models)
                        + "). "
                        + (lastTransportError != null
                                ? lastTransportError.getMessage()
                                : "Unknown network error."),
                lastTransportError
        );
    }

    @SuppressWarnings("unchecked")
    private Integer usageTokens(Map<String, Object> response, String field) {
        try {
            Object usage = response.get("usage");
            if (!(usage instanceof Map<?, ?> usageMap)) {
                return null;
            }
            Object value = ((Map<String, Object>) usageMap).get(field);
            return value instanceof Number number ? number.intValue() : null;
        } catch (Exception ignore) {
            return null;
        }
    }

    private void sleepBeforeRetry(int seconds) {
        if (seconds <= 0) {
            return;
        }
        try {
            log.warn("Waiting {}s before retrying OpenAI with another model.", seconds);
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private int extractRetryDelaySeconds(String body) {
        if (body == null || body.isBlank()) {
            return 0;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode error = root.path("error");
            if (error.has("type") && "rate_limit_error".equals(error.path("type").asText())) {
                // OpenAI sometimes embeds "Retry-After" style hints in the message.
                return Math.min(5, retryDelayMaxSeconds);
            }
        } catch (Exception ignore) {
            // fall back to no sleep
        }
        return 0;
    }

    private String extractErrorMessage(String body) {
        if (body == null || body.isBlank()) {
            return "No error details provided by OpenAI.";
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode error = root.path("error");
            String message = error.path("message").asText();
            if (message.isBlank()) {
                message = error.path("type").asText();
            }
            if (message.isBlank()) {
                message = root.toString();
            }
            return message;
        } catch (Exception parseException) {
            return body.length() > 300 ? body.substring(0, 300) + "..." : body;
        }
    }
}
