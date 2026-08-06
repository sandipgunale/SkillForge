package com.project.skillforgebackend.ai.guardrail;

import com.project.skillforgebackend.config.properties.AiServiceProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Prompt-injection guardrail for user-supplied input that ends up inside
 * AI prompts (topic names, learning-path titles/goals, question counts).
 *
 * <p>Defends the system prompt by (a) capping field and prompt sizes,
 * (b) stripping control characters, and (c) rejecting prompt-manipulation
 * phrasing ("ignore previous instructions", "you are now", ...). Rejections
 * throw {@link IllegalArgumentException} so the API layer answers 400
 * (client input problem) instead of 502 (AI outage).
 */
@Component
public class AiPromptGuard {

    private static final Pattern CONTROL_CHARS =
            Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]");

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+(all\\s+)?(previous|prior|above)\\s+instructions?"),
            Pattern.compile("(?i)disregard\\s+(all\\s+)?(previous|prior|above)"),
            Pattern.compile("(?i)(system|developer|hidden)\\s+prompt\\s*[:=]"),
            Pattern.compile("(?i)pretend\\s+(you\\s+(are|'re)|to\\s+be)"),
            Pattern.compile("(?i)do\\s+not\\s+follow\\s+(your|the)\\s+(system\\s+)?(prompt|instructions?)"),
            Pattern.compile("(?i)reveal\\s+(your|the)\\s+(system|internal|hidden|initial)"),
            Pattern.compile("(?i)you\\s+are\\s+now\\s+(in|acting\\s+as|running)"),
            Pattern.compile("(?i)repeat\\s+(your|the)\\s+(system|initial)\\s+prompt"),
            Pattern.compile("(?i)forget\\s+(all\\s+)?(your\\s+)?(previous|prior|above)\\s+(instructions?|rules?|prompts?)")
    );

    private final AiServiceProperties properties;

    public AiPromptGuard(AiServiceProperties properties) {
        this.properties = properties;
    }

    /**
     * Validates a user-supplied field that will be interpolated into a
     * prompt. Throws {@link IllegalArgumentException} when the guard is
     * enabled and the value is too long or looks like an injection attempt.
     */
    public void guardInput(String value, String fieldName) {

        if (!properties.guardEnabled()) {
            return;
        }

        if (value == null || value.isBlank()) {

            throw new IllegalArgumentException(
                    fieldName + " must not be blank."
            );
        }

        if (value.length() > properties.maxFieldLength()) {

            throw new IllegalArgumentException(
                    fieldName + " is too long (max "
                            + properties.maxFieldLength() + " characters)."
            );
        }

        for (Pattern pattern : INJECTION_PATTERNS) {

            if (pattern.matcher(value).find()) {

                throw new IllegalArgumentException(
                        fieldName + " contains unsupported content."
                );
            }
        }
    }

    /**
     * Bounds the number of questions a caller may request per call.
     */
    public void guardQuestionCount(int count) {

        if (!properties.guardEnabled()) {
            return;
        }

        if (count < 1 || count > properties.maxQuestionCount()) {

            throw new IllegalArgumentException(
                    "Question count must be between 1 and "
                            + properties.maxQuestionCount() + "."
            );
        }
    }

    /**
     * Bounds the total size of a prompt sent to a provider. Protects the
     * token budget and prevents degenerate inputs from dominating a call.
     */
    public void guardPromptLength(String prompt) {

        if (!properties.guardEnabled() || prompt == null) {
            return;
        }

        if (prompt.length() > properties.maxPromptLength()) {

            throw new IllegalArgumentException(
                    "Prompt too large (max "
                            + properties.maxPromptLength() + " characters)."
            );
        }
    }

    /**
     * Strips control characters from a value before it is interpolated
     * into a prompt (allows the benign whitespace trio).
     */
    public String sanitize(String value) {

        if (value == null) {
            return null;
        }

        return CONTROL_CHARS.matcher(value).replaceAll("");
    }
}