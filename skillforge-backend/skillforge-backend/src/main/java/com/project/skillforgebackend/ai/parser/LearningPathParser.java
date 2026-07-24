package com.project.skillforgebackend.ai.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.skillforgebackend.ai.exception.AIServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LearningPathParser {

    private final ObjectMapper objectMapper;

    public String parse(String response) {

        String cleaned = ParserUtils.cleanJson(response);

        if (cleaned == null || cleaned.isBlank()) {

            throw new AIServiceException(
                    "AI returned an empty learning path."
            );
        }

        try {

            objectMapper.readTree(cleaned);

            return cleaned;

        } catch (Exception ex) {

            throw new AIServiceException(
                    "AI returned invalid roadmap JSON.",
                    ex
            );
        }
    }
}