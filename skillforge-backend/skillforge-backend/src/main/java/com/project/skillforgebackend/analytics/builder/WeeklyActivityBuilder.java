package com.project.skillforgebackend.analytics.builder;

import com.project.skillforgebackend.analytics.dto.WeeklyActivityDto;
import com.project.skillforgebackend.progress.entity.Progress;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class WeeklyActivityBuilder {

    public List<WeeklyActivityDto> build(
            List<Progress> weeklyProgress
    ) {

        Map<DayOfWeek, Integer> activityMap = new LinkedHashMap<>();

        for (DayOfWeek day : DayOfWeek.values()) {
            activityMap.put(day, 0);
        }

        weeklyProgress.forEach(progress -> {

            DayOfWeek day =
                    progress.getLastActivityAt().getDayOfWeek();

            activityMap.put(
                    day,
                    activityMap.get(day)
                            + progress.getMinutesSpent()
            );

        });

        return activityMap.entrySet()
                .stream()
                .map(entry ->

                        WeeklyActivityDto.builder()

                                .day(entry.getKey().name().substring(0,3))

                                .minutes(entry.getValue())

                                .build()

                )

                .toList();

    }

}