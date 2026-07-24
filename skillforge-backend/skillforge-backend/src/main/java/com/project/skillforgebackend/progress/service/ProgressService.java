package com.project.skillforgebackend.progress.service;

import com.project.skillforgebackend.progress.dto.ProgressDto;
import com.project.skillforgebackend.progress.entity.Progress;
import com.project.skillforgebackend.progress.mapper.ProgressMapper;
import com.project.skillforgebackend.progress.repository.ProgressRepository;
import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgressService {
    private static final int QUIZ_DURATION_MINUTES = 10;
    private static final short COMPLETION_PER_QUIZ = 10;
    private final ProgressRepository progressRepository;
    private final ProgressMapper progressMapper;


    private Progress getOrCreateProgress(
            User user,
            Topic topic
    ) {

        return progressRepository
                .findByUserAndTopic(user, topic)
                .orElseGet(() ->

                        Progress.builder()
                                .user(user)
                                .topic(topic)
                                .build()

                );

    }
    /**
     * Updates user progress after every completed quiz.
     */
    public void updateAfterQuiz(
            User user,
            Topic topic,
            QuizResultDto result
    ) {

        Progress progress =
                getOrCreateProgress(
                        user,
                        topic
                );

        // Previous quiz count
        int previousQuizCount = progress.getQuizzesTaken();

        // Increase quiz count
        progress.setQuizzesTaken(previousQuizCount + 1);

        // Calculate new average score
        BigDecimal previousTotal = progress.getAverageScore()
                .multiply(BigDecimal.valueOf(previousQuizCount));

        BigDecimal newAverage = previousTotal
                .add(BigDecimal.valueOf(
                        result.getSummary().getPercentage()
                ))
                .divide(
                        BigDecimal.valueOf(progress.getQuizzesTaken()),
                        2,
                        RoundingMode.HALF_UP
                );

        progress.setAverageScore(newAverage);

        // Temporary completion logic
        progress.setCompletionPercentage(
                (short) Math.min(100, progress.getQuizzesTaken() * COMPLETION_PER_QUIZ)
        );

        // Temporary quiz duration (10 minutes)
        progress.setMinutesSpent(
                progress.getMinutesSpent() + QUIZ_DURATION_MINUTES
        );

        progress.setLastActivityAt(
                LocalDateTime.now()
        );

        progressRepository.save(progress);
    }

    /**
     * Returns user's dashboard progress.
     */
    @Transactional(readOnly = true)
    public ProgressDto getProgress(User user) {

        List<Progress> progressList =
                progressRepository.findByUserOrderByLastActivityAtDesc(user);

        int totalTopics = progressList.size();

        int completedTopics = (int) progressList.stream()
                .filter(progress ->
                        progress.getCompletionPercentage() == 100
                )
                .count();

        int totalQuizzesTaken = progressList.stream()
                .mapToInt(Progress::getQuizzesTaken)
                .sum();

        int totalMinutesSpent = progressList.stream()
                .mapToInt(Progress::getMinutesSpent)
                .sum();

        BigDecimal overallAverageScore;

        if (progressList.isEmpty()) {

            overallAverageScore = BigDecimal.ZERO;

        } else {

            double average = progressList.stream()
                    .map(Progress::getAverageScore)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0);

            overallAverageScore = BigDecimal.valueOf(average)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return ProgressDto.builder()
                .totalTopics(totalTopics)
                .completedTopics(completedTopics)
                .totalQuizzesTaken(totalQuizzesTaken)
                .totalMinutesSpent(totalMinutesSpent)
                .overallAverageScore(overallAverageScore)
                .topics(
                        progressList.stream()
                                .map(progressMapper::toTopicProgressDto)
                                .toList()
                )
                .build();
    }

}