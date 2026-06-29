package com.project.skillforgebackend.ai.service;

import com.project.skillforgebackend.quiz.dto.QuizResultDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Profile("dev")
@Slf4j
public class MockAIService implements AIService {

    @Override
    public List<Question> generateQuestions(
            String topic,
            Resource.Difficulty difficulty,
            int count,
            List<Question.QuestionType> questionTypes
    ) {

        log.info("Using MockAIService");

        List<Question> questions = new ArrayList<>();

        for (int i = 1; i <= count; i++) {

            Question question = Question.builder()
                    .type(Question.QuestionType.MCQ)
                    .content("Mock Question " + i + " on " + topic)
                    .optionsJson("""
                            ["Option A","Option B","Option C","Option D"]
                            """)
                    .correctAnswer("Option A")
                    .orderIndex(i)
                    .build();

            questions.add(question);
        }

        return questions;
    }

    @Override
    public QuizResultDto evaluateQuiz(Quiz quiz) {

        int total = quiz.getQuestions().size();

        return QuizResultDto.builder()
                .quizId(quiz.getId().toString())
                .score(total)
                .maxScore(total)
                .percentage(100.0)
                .overallFeedback("Mock evaluation completed successfully.")
                .strengths(List.of(
                        "Good understanding",
                        "Answered mock quiz"
                ))
                .weaknesses(List.of())
                .improvements(List.of(
                        "Real AI evaluation will be available later."
                ))
                .questions(new ArrayList<>())
                .build();
    }

}