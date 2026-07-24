package com.project.skillforgebackend.ai.parser;

public final class ParserUtils {

    private ParserUtils() {
    }

    /**
     * Removes Markdown code fences and extracts the JSON object.
     */
    public static String cleanJson(String response) {

        if (response == null) {
            return "";
        }

        response = response.trim();

        response = response.replace("```json", "");
        response = response.replace("```", "");

        int first = response.indexOf('{');
        int last = response.lastIndexOf('}');

        if (first >= 0 && last > first) {
            response = response.substring(first, last + 1);
        }

        return response.trim();
    }

}