package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.config.properties.GeminiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class GeminiClient implements AiProvider {

    private final RestClient restClient;

    private final String apiKey;

    private final List<String> models;

    private final double temperature;

    private final int retryDelayMaxSeconds;

    private final int transportRetrySleepSeconds;

    private int modelIndex = 0;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiClient(GeminiProperties properties) {

        this.apiKey = properties.apiKey();

        this.models = properties.models();

        this.temperature = properties.temperature();

        this.retryDelayMaxSeconds = properties.retryDelayMaxSeconds();

        this.transportRetrySleepSeconds = properties.transportRetrySleepSeconds();

        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader(
                        "Content-Type",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .requestFactory(requestFactory(properties))
                .build();
    }

    /**
     * Explicit timeouts so a dead or sleeping network fails fast instead of
     * holding a request open for minutes (each failed model attempt then
     * costs connect + read time, not an indefinite hang).
     */
    private SimpleClientHttpRequestFactory requestFactory(
            GeminiProperties properties
    ) {

        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(properties.connectTimeoutMs());

        factory.setReadTimeout(properties.readTimeoutMs());

        return factory;
    }

    private synchronized String currentModel() {

        return models.get(modelIndex);
    }

    private synchronized void advanceModel() {

        modelIndex = (modelIndex + 1) % models.size();

        log.warn("Switching Gemini model to {}", models.get(modelIndex));
    }

    @Override
    public String providerName() {
        return "gemini";
    }

    /**
     * Sends prompt to Google Gemini and returns generated text.
     * See {@link #completeWithMetadata(String)} for the enriched form.
     */
    @Override
    public String complete(String prompt) {
        return completeWithMetadata(prompt).text();
    }

    /**
     * Sends prompt to Google Gemini and returns the generated text together
     * with the selected model and reported token usage.
     *
     * <p>On HTTP 429 (quota / rate limit) or a transport failure (DNS /
     * connection refused) the client automatically retries with the next
     * configured model, since free-tier quotas are per model.
     */
    @Override
    public AiCompletionResult completeWithMetadata(String prompt) {

        Map<String, Object> request = Map.of(

                "contents",
                List.of(

                        Map.of(

                                "parts",

                                List.of(

                                        Map.of(
                                                "text",
                                                prompt
                                        )

                                )

                        )

                ),

                "generationConfig",
                Map.of(

                        "temperature",
                        temperature

                )

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

                        .uri(uriBuilder ->
                                uriBuilder
                                .path("/models/" + model + ":generateContent")
                                .queryParam("key", apiKey)
                                .build()
                        )

                        .contentType(MediaType.APPLICATION_JSON)

                        .body(request)

                        .retrieve()

                        .body(Map.class);

                if (response == null) {
                    throw new AIServiceException(
                            "Empty response received from Gemini."
                    );
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates =
                        (List<Map<String, Object>>) response.get("candidates");

                if (candidates == null || candidates.isEmpty()) {
                    throw new AIServiceException(
                            "No candidates returned by Gemini."
                    );
                }

                Map<String, Object> candidate = candidates.get(0);

                @SuppressWarnings("unchecked")
                Map<String, Object> content =
                        (Map<String, Object>) candidate.get("content");

                if (content == null) {
                    throw new AIServiceException(
                            "Gemini returned empty content."
                    );
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts =
                        (List<Map<String, Object>>) content.get("parts");

                if (parts == null || parts.isEmpty()) {
                    throw new AIServiceException(
                            "Gemini returned empty parts."
                    );
                }

                Object text = parts.get(0).get("text");

                if (text == null) {
                    throw new AIServiceException(
                            "Gemini returned empty text."
                    );
                }

                log.info("Gemini response received from model {}.", model);

                return new AiCompletionResult(
                        text.toString().trim(),
                        model,
                        providerName(),
                        usageMetadata(response, "promptTokenCount"),
                        usageMetadata(response, "candidatesTokenCount"),
                        (System.nanoTime() - startedAt) / 1_000_000L
                );

            } catch (HttpStatusCodeException ex) {

                log.error(
                        "Gemini HTTP Status : {} (model {})",
                        ex.getStatusCode(),
                        model
                );

                log.error(
                        "Gemini Response : {}",
                        extractErrorMessage(
                                ex.getResponseBodyAsString()
                        )
                );

                if (ex.getStatusCode().value() == 429) {

                    lastHttpError = ex;

                    sleepBeforeRetry(
                            extractRetryDelaySeconds(
                                    ex.getResponseBodyAsString()
                            )
                    );

                    advanceModel();

                    continue;
                }

                throw new AIServiceException(
                        "Gemini API Error ("
                                + ex.getStatusCode().value()
                                + "): "
                                + extractErrorMessage(
                                        ex.getResponseBodyAsString()
                                ),
                        ex
                );

            } catch (AIServiceException ex) {

                throw ex;

            } catch (ResourceAccessException ex) {

                log.error(
                        "Failed to reach Gemini (model {}): {}",
                        model,
                        ex.getMessage()
                );

                lastTransportError = ex;

                sleepBeforeRetry(transportRetrySleepSeconds);

                advanceModel();

            } catch (Exception ex) {

                log.error(
                        "Unexpected Gemini error.",
                        ex
                );

                throw new AIServiceException(
                        "Failed to communicate with Gemini.",
                        ex
                );
            }
        }

        if (lastHttpError != null) {

            throw new AIServiceException(
                    "Gemini rate limit exceeded on all models ("
                            + String.join(", ", models)
                            + "). "
                            + extractErrorMessage(
                                    lastHttpError.getResponseBodyAsString()
                            ),
                    lastHttpError
            );
        }

        throw new AIServiceException(
                "Unable to reach Gemini on all models ("
                        + String.join(", ", models)
                        + "). "
                        + (lastTransportError != null
                                ? lastTransportError.getMessage()
                                : "Unknown network error."),
                lastTransportError
        );
    }

    private void sleepBeforeRetry(int seconds) {

        if (seconds <= 0) {

            return;
        }

        try {

            log.warn(
                    "Waiting {}s before retrying Gemini with another model.",
                    seconds
            );

            Thread.sleep(seconds * 1000L);

        } catch (InterruptedException interrupted) {

            Thread.currentThread().interrupt();
        }
    }

    /**
     * Reads an integer field from the vendor {@code usageMetadata} object,
     * tolerating its absence (older models do not report token usage).
     */
    @SuppressWarnings("unchecked")
    private Integer usageMetadata(Map<String, Object> response, String field) {

        try {

            Object usage = response.get("usageMetadata");

            if (!(usage instanceof Map<?, ?> usageMap)) {
                return null;
            }

            Object value = ((Map<String, Object>) usageMap).get(field);

            return value instanceof Number number
                    ? number.intValue()
                    : null;

        } catch (Exception ignore) {

            return null;
        }
    }

    private int extractRetryDelaySeconds(String body) {

        if (body == null || body.isBlank()) {

            return 0;
        }

        try {

            JsonNode root = objectMapper.readTree(body);

            for (JsonNode detail : root.path("error").path("details")) {

                if ("type.googleapis.com/google.rpc.RetryInfo"
                        .equals(detail.path("@type").asText())) {

                    String delay = detail.path("retryDelay").asText();

                    if (delay.endsWith("s")) {

                        return Math.min(
                                Integer.parseInt(
                                        delay.substring(0, delay.length() - 1)
                                ),
                                retryDelayMaxSeconds
                        );
                    }
                }
            }

        } catch (Exception ignore) {

            // fall back to no sleep
        }

        return 5;
    }

    private String extractErrorMessage(String body) {

        if (body == null || body.isBlank()) {

            return "No error details provided by Gemini.";
        }

        try {

            JsonNode root = objectMapper.readTree(body);

            JsonNode error = root.path("error");

            String message = error.path("message").asText();

            if (message.isBlank()) {

                message = error.path("status").asText();
            }

            if (message.isBlank()) {

                message = root.toString();
            }

            for (JsonNode detail : error.path("details")) {

                if ("type.googleapis.com/google.rpc.RetryInfo"
                        .equals(detail.path("@type").asText())) {

                    String delay = detail.path("retryDelay").asText();

                    if (!delay.isBlank()) {

                        message += " Retry after " + delay + ".";
                    }

                    break;
                }
            }

            return message;

        } catch (Exception parseException) {

            return body.length() > 300
                    ? body.substring(0, 300) + "..."
                    : body;
        }
    }

}
