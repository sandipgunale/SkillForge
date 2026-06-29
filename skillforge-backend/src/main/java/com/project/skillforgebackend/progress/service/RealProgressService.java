package com.project.skillforgebackend.progress.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("prod")
@Slf4j
public class RealProgressService implements ProgressService {

    @Override
    public void updateAfterQuiz(
            User user,
            Topic topic,
            QuizResultDto result
    ) {

        throw new UnsupportedOperationException(
                "Progress module not implemented yet."
        );

    }

}