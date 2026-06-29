package com.project.skillforgebackend.ai.service;


import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;

import java.util.List;

public interface AIService {

    List<Question> generateQuestions(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> questionTypes
    );

    QuizResultDto evaluateQuiz(Quiz quiz);

}
