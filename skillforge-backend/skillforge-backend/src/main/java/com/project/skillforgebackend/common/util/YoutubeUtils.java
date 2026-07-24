package com.project.skillforgebackend.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class YoutubeUtils {

    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:youtube\\.com/(?:.*v=|embed/|v/)|youtu\\.be/)([A-Za-z0-9_-]{11})"
    );

    private YoutubeUtils() {
    }

    public static String extractVideoId(String url) {

        if (url == null || url.isBlank()) {
            return null;
        }

        Matcher matcher = YOUTUBE_PATTERN.matcher(url);

        return matcher.find()
                ? matcher.group(1)
                : null;
    }

}