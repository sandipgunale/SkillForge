package com.project.skillforgebackend.analytics.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class AnalyticsUtils {

    private AnalyticsUtils() {
    }

    public static BigDecimal calculatePercentage(
            int score,
            int maxScore
    ) {

        if (maxScore <= 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(
                ((double) score / maxScore) * 100
        ).setScale(2, RoundingMode.HALF_UP);

    }

}