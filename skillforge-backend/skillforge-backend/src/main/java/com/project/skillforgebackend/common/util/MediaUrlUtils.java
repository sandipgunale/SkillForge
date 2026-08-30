package com.project.skillforgebackend.common.util;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Validates and normalizes external media/content URLs and lesson material
 * payloads. External media is treated as untrusted: only http(s) schemes are
 * permitted, and material entries must carry a safe URL. Embed-domain
 * allowlisting for first-party players is enforced client side; here we ensure
 * the URL is well-formed and not a dangerous scheme.
 */
public final class MediaUrlUtils {

    private MediaUrlUtils() {
    }

    public static String sanitize(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            throw new IllegalArgumentException("Only http(s) media URLs are allowed.");
        }
        return trimmed;
    }

    public static JsonNode sanitizeMaterials(JsonNode materials) {
        if (materials == null || materials.isNull()) {
            return null;
        }
        if (!materials.isArray()) {
            throw new IllegalArgumentException("Materials must be a JSON array.");
        }
        for (JsonNode node : materials) {
            JsonNode title = node.get("title");
            JsonNode url = node.get("url");
            if (title == null || title.asText().isBlank()) {
                throw new IllegalArgumentException("Each material requires a non-blank title.");
            }
            if (url == null || url.asText().isBlank()) {
                throw new IllegalArgumentException("Each material requires a non-blank url.");
            }
            sanitize(url.asText());
        }
        return materials;
    }
}
