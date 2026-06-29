package com.project.skillforgebackend.ai.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class OpenAIService implements AIService {

    @Override
    public List<Question> generateQuestions(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> questionTypes
    ) {

        throw new UnsupportedOperationException(
                "OpenAI integration not implemented yet."
        );
    }

    @Override
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        throw new UnsupportedOperationException(
                "OpenAI integration not implemented yet."
        );
    }

}