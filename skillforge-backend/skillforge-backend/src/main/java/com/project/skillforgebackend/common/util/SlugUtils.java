package com.project.skillforgebackend.common.util;

public final class SlugUtils {

    private SlugUtils() {
    }

    public static String generate(String text) {

        return text.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

}