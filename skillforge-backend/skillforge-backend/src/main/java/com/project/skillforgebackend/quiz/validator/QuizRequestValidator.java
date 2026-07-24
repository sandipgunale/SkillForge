package com.project.skillforgebackend.quiz.validator;

import com.project.skillforgebackend.quiz.dto.QuizRequest;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import org.springframework.stereotype.Component;

@Component
public class QuizRequestValidator {

    public void validate(QuizRequest request) {

        switch (request.getSource()) {

            case TOPIC -> {

                if (request.getTopicId() == null) {
                    throw new IllegalArgumentException(
                            "Topic ID is required."
                    );
                }
            }

            case LEARNING_PATH -> {

                if (request.getLearningPathId() == null) {
                    throw new IllegalArgumentException(
                            "Learning Path ID is required."
                    );
                }

                if (request.getWeekNumber() == null) {
                    throw new IllegalArgumentException(
                            "Week Number is required."
                    );
                }
            }
        }
    }
}