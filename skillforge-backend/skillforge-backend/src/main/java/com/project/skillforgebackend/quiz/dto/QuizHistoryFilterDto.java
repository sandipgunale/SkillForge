package com.project.skillforgebackend.quiz.dto;

import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import lombok.Data;

@Data
public class QuizHistoryFilterDto {

    private QuizSource source;

    private Resource.Difficulty difficulty;

    private Quiz.QuizStatus status;

    private Integer page = 0;

    private Integer size = 10;

    private String sortBy = "completedAt";

    private String sortDirection = "desc";

}