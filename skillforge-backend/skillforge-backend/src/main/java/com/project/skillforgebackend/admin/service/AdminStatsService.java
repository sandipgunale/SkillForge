package com.project.skillforgebackend.admin.service;

import com.project.skillforgebackend.admin.dto.AdminStatsDto;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.repository.QuizRepository;
import com.project.skillforgebackend.resource.repository.ResourceRepository;
import com.project.skillforgebackend.resource.repository.TopicRepository;
import com.project.skillforgebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        return AdminStatsDto.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository
                        .countByIsActiveTrue())
                .totalTopics(topicRepository.count())
                .totalResources(resourceRepository.count())
                .totalQuizzes(quizRepository.count())
                .completedQuizzes(quizRepository
                        .countByStatus(Quiz.QuizStatus.COMPLETED))
                .build();
    }
}