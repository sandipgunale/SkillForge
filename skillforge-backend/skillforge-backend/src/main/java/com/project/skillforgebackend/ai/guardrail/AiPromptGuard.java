package com.project.skillforgebackend.ai.guardrail;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import com.project.skillforgebackend.config.properties.AiServiceProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Input guardrail for everything that ends up inside a prompt: rejects
 * oversized fields, strips control characters, and blocks obvious
 * prompt-injection directives ("ignore previous instructions", "pretend
 * you are the system", ...) from reaching the model.
 *
 * <p>This is a deterministic first line of defence, not a substitute for
 * treating model output as untrusted data downstream.
 */
@Component
public class AiPromptGuard {

    private final AiServiceProperties properties;

    private static final Pattern CONTROL_CHARS =
            Pattern.compile("\\p{Cntrl}");

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+(all\\s+)?previous\\s+instructions"),
            Pattern.compile("(?i)ignore\\s+(all\\s+)?prior\\s+instructions"),
            Pattern.compile("(?i)disregard\\s+(all\\s+)?(previous|prior|above)\\s+instructions"),
            Pattern.compile("(?i)forget\\s+(all\\s+)?(previous|prior|above)\\s+instructions"),
            Pattern.compile("(?i)pretend\\s+you\\s+are\\s+(the\\s+)?system"),
            Pattern.compile("(?i)you\\s+are\\s+now\\s+(the\\s+)?(system|a\\s+different\\s+ai)"),
            Pattern.compile("(?i)reveal\\s+(your|the)\\s+(system|internal)\\s+prompt"),
            Pattern.compile("(?i)print\\s+your\\s+(system|internal)\\s+prompt"),
            Pattern.compile("(?i)do\\s+not\\s+follow\\s+the\\s+(instructions|rules|prompt)"),
            Pattern.compile("(?i)override\\s+(the\\s+)?(instructions|rules|prompt)"),
            Pattern.compile("(?i)act\\s+as\\s+if\\s+you\\s+have\\s+no\\s+(restrictions|rules|constraints)"),
            Pattern.compile("(?i)\\bDAN\\b")
    );

    public AiPromptGuard(AiServiceProperties properties) {
        this.properties = properties;
    }

    /**
     * Validates and sanitises a single user-supplied prompt field.
     *
     * @return the sanitised value (control characters removed, trimmed)
     * @throws AIServiceException when blank, oversized, or injection-flagged
     */
    public String guardField(String value, String fieldName) {

        if (value == null || value.isBlank()) {
            throw new AIServiceException(fieldName + " must not be empty.");
        }

        String sanitised = CONTROL_CHARS.matcher(value).replaceAll("").trim();

        if (sanitised.length() > properties.maxFieldLength()) {
            throw new AIServiceException(
                    fieldName + " must not exceed "
                            + properties.maxFieldLength()
                            + " characters."
            );
        }

        rejectInjection(sanitised, fieldName);

        return sanitised;
    }

    /**
     * Validates the number of questions requested in one generation call.
     */
    public void guardQuestionCount(int count) {

        if (count < 1 || count > properties.maxQuestionsPerRequest()) {
            throw new AIServiceException(
                    "Question count must be between 1 and "
                            + properties.maxQuestionsPerRequest()
                            + "."
            );
        }
    }

    /**
     * Validates the total size of the assembled prompt before it is sent
     * to the provider (protects the token budget from pathological input).
     */
    public void guardPromptLength(String prompt) {

        if (prompt != null && prompt.length() > properties.maxPromptLength()) {
            throw new AIServiceException(
                    "Prompt exceeds the maximum allowed size of "
                            + properties.maxPromptLength()
                            + " characters."
            );
        }
    }

    private void rejectInjection(String value, String fieldName) {

        for (Pattern pattern : INJECTION_PATTERNS) {

            if (pattern.matcher(value).find()) {

                throw new AIServiceException(
                        fieldName + " contains a prohibited instruction pattern."
                );
            }
        }
    }
}