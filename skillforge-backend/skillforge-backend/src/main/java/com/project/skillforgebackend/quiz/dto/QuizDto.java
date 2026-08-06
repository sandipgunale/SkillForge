package com.project.skillforgebackend.quiz.dto;

import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDto {

    private String id;

    private String topicName;

    private String learningPathTitle;

    private Resource.Difficulty difficulty;

    private Quiz.QuizStatus status;

    private int totalQuestions;

    private int score;

    private int maxScore;

    private LocalDateTime startedAt;

    private LocalDateTime expiresAt;

    private LocalDateTime completedAt;

    private List<QuestionDto> questions;

    private QuizSource source;

    private String learningPathId;

    private Integer weekNumber;
}