package com.project.skillforgebackend.ai.client;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class GeminiClient {

    private final RestClient restClient;

    private final String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.temperature:0.7}")
    private Double temperature;

    public GeminiClient(
            @Value("${gemini.api-key}") String apiKey
    ) {

        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader(
                        "Content-Type",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    /**
     * Sends prompt to Google Gemini
     * and returns generated text.
     */
    public String complete(String prompt) {

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

            log.info("Gemini response received successfully.");

            return text.toString().trim();

        } catch (HttpStatusCodeException ex) {

            log.error(
                    "Gemini HTTP Status : {}",
                    ex.getStatusCode()
            );

            log.error(
                    "Gemini Response : {}",
                    ex.getResponseBodyAsString()
            );

            throw new AIServiceException(
                    "Gemini API Error : "
                            + ex.getResponseBodyAsString(),
                    ex
            );

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

}