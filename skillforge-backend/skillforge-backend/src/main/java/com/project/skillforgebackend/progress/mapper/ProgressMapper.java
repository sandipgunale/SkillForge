package com.project.skillforgebackend.progress.mapper;

import com.project.skillforgebackend.progress.dto.TopicProgressDto;
import com.project.skillforgebackend.progress.entity.Progress;
import org.springframework.stereotype.Component;

@Component
public class ProgressMapper {

    public TopicProgressDto toTopicProgressDto(Progress progress) {

        if (progress == null) {
            return null;
        }

        return TopicProgressDto.builder()
                .topicId(progress.getTopic().getId().toString())
                .topicName(progress.getTopic().getName())
                .completionPercentage(progress.getCompletionPercentage())
                .quizzesTaken(progress.getQuizzesTaken())
                .minutesSpent(progress.getMinutesSpent())
                .averageScore(progress.getAverageScore())
                .build();
    }

}