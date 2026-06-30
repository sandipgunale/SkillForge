package com.project.skillforgebackend.quiz.repository;

import com.project.skillforgebackend.quiz.entity.Question;
import com.project.skillforgebackend.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    /**
     * All questions of a quiz.
     */
    List<Question> findByQuiz(Quiz quiz);

    /**
     * Ordered questions.
     */
    List<Question> findByQuizOrderByOrderIndexAsc(Quiz quiz);

}