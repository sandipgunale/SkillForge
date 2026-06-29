package com.project.skillforgebackend.progress.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;

public interface ProgressService {

    void updateAfterQuiz(
            User user,
            Topic topic,
            QuizResultDto result
    );

}