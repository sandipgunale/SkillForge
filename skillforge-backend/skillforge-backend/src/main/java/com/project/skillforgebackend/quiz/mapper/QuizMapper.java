package com.project.skillforgebackend.quiz.mapper;

import com.project.skillforgebackend.quiz.dto.QuestionDto;
import com.project.skillforgebackend.quiz.dto.QuizDto;
import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Component
public class QuizMapper {

    /**
     * Convert Quiz Entity to QuizDto.
     */
    public QuizDto toDto(Quiz quiz) {

        if (quiz == null) {
            return null;
        }

        return QuizDto.builder()
                .id(quiz.getId().toString())
                .topic(quiz.getTopic().getName())
                .difficulty(quiz.getDifficulty())
                .status(quiz.getStatus())
                .totalQuestions(quiz.getTotalQuestions())
                .score(quiz.getScore())
                .maxScore(quiz.getMaxScore())
                .startedAt(quiz.getStartedAt())
                .completedAt(quiz.getCompletedAt())
                .questions(toQuestionDtoList(quiz.getQuestions()))
                .build();
    }

    /**
     * Convert Question Entity to QuestionDto.
     */
    public QuestionDto toQuestionDto(Question question) {

        if (question == null) {
            return null;
        }

        return QuestionDto.builder()
                .id(question.getId().toString())
                .type(question.getType())
                .content(question.getContent())
                .optionsJson(question.getOptionsJson())
                .orderIndex(question.getOrderIndex())
                .build();
    }

    /**
     * Convert List<Question> to List<QuestionDto>.
     */
    public List<QuestionDto> toQuestionDtoList(List<Question> questions) {

        if (questions == null || questions.isEmpty()) {
            return Collections.emptyList();
        }

        return questions.stream()
                .sorted(Comparator.comparingInt(Question::getOrderIndex))
                .map(this::toQuestionDto)
                .toList();
    }

}