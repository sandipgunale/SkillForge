package com.project.skillforgebackend.progress.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.resource.entity.Topic;
import com.project.skillforgebackend.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("dev")
@Slf4j
public class MockProgressService implements ProgressService {

    @Override
    public void updateAfterQuiz(
            User user,
            Topic topic,
            QuizResultDto result
    ) {

        log.info("""
                Mock Progress Updated
                User      : {}
                Topic     : {}
                Score     : {}/{}
                """,
                user.getEmail(),
                topic.getName(),
                result.getScore(),
                result.getMaxScore()
        );

    }

}