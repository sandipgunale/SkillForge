package com.project.skillforgebackend.ai.prompt;

import com.project.skillforgebackend.ai.exception.AIServiceException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Loads and renders prompt templates stored as resources under
 * {@code classpath:ai/prompts/*.txt}. Prompt text lives next to the code
 * as plain files (reviewable, versionable, baseline-able) instead of inline
 * Java strings, while builders fill the {@code {{TOKEN}}} placeholders.
 *
 * <p>Rendering replaces <em>all</em> occurrences of a token and fails fast
 * when a substitution value is missing, so a template/code drift surfaces
 * as a clear {@link AIServiceException} at call time instead of silently
 * producing a broken prompt.
 */
@Component
public class PromptTemplateLoader {

    private static final Pattern TOKEN =
            Pattern.compile("\\{\\{([A-Z][A-Z0-9_]*)\\}\\}");

    private final ResourceLoader resourceLoader;

    private final ConcurrentHashMap<String, String> templates =
            new ConcurrentHashMap<>();

    public PromptTemplateLoader(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Renders a template from {@code ai/prompts/<path>} with the given
     * values, caching the raw template after first load.
     *
     * @param resourcePath classpath-relative path, e.g. {@code ai/prompts/quiz-single.txt}
     * @param values        placeholders keyed by token name (without braces)
     * @return the fully substituted prompt
     */
    public String render(String resourcePath, Map<String, ? extends Object> values) {

        String template = template(resourcePath);

        Matcher matcher = TOKEN.matcher(template);

        StringBuilder rendered = new StringBuilder(template.length());

        while (matcher.find()) {

            String token = matcher.group(1);

            Object value = values.get(token);

            if (value == null) {

                throw new AIServiceException(
                        "Prompt template " + resourcePath
                                + " references undefined token {{"
                                + token + "}}."
                );
            }

            matcher.appendReplacement(
                    rendered,
                    Matcher.quoteReplacement(String.valueOf(value))
            );
        }

        matcher.appendTail(rendered);

        return rendered.toString();
    }

    /**
     * Loads and caches a template. All prompt templates share one small
     * cache; the largest is ~1 KB of text, so memory stays trivial.
     */
    private String template(String resourcePath) {

        return templates.computeIfAbsent(resourcePath, path -> {

            Resource resource =
                    resourceLoader.getResource("classpath:" + path);

            if (!resource.exists()) {

                throw new AIServiceException(
                        "Prompt template not found: " + path
                );
            }

            try {

                return resource.getContentAsString(StandardCharsets.UTF_8);

            } catch (IOException ex) {

                throw new AIServiceException(
                        "Failed to load prompt template: " + path,
                        ex
                );
            }
        });
    }

    /** Clears the template cache (used by tests and template reload tooling). */
    public void clearCache() {
        templates.clear();
    }
}