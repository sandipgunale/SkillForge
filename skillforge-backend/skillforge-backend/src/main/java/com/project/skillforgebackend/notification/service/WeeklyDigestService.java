package com.project.skillforgebackend.notification.service;

import com.project.skillforgebackend.notification.repository.NotificationRepository;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.user.entity.User;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Weekly digest: every Monday morning a summary of the past 7 days is
 * pushed to each active user as an in-app notification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyDigestService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "${notification.weekly-digest-cron:0 0 8 * * MON}")
    @Transactional
    public void sendWeeklyDigest() {
        LocalDateTime weekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);

        for (User user : userRepository.findByIsActiveTrue()) {

            long completed = quizRepository
                    .countByUserAndStatusAndCompletedAtAfter(
                            user,
                            Quiz.QuizStatus.COMPLETED,
                            weekAgo
                    );

            if (completed == 0) {
                continue;
            }

            notificationRepository.save(
                    com.project.skillforgebackend.notification.entity.Notification.builder()
                            .user(user)
                            .type("DIGEST")
                            .title("Your weekly learning summary")
                            .message(
                                    "You completed "
                                            + completed
                                            + " quiz"
                                            + (completed == 1 ? "" : "zes")
                                            + " this week. Great progress!"
                            )
                            .build()
            );
        }

        log.info("Weekly digest sent to active users.");
    }

}