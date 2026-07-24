package com.project.skillforgebackend.quiz.specification;

import com.project.skillforgebackend.quiz.entity.Quiz;
import com.project.skillforgebackend.quiz.entity.QuizSource;
import com.project.skillforgebackend.resource.entity.Resource;
import com.project.skillforgebackend.user.entity.User;
import org.springframework.data.jpa.domain.Specification;

public final class QuizSpecification {

    private QuizSpecification() {
    }

    public static Specification<Quiz> hasUser(User user) {

        return (root, query, cb) ->
                cb.equal(root.get("user"), user);
    }

    public static Specification<Quiz> hasSource(
            QuizSource source
    ) {

        return (root, query, cb) ->

                source == null

                        ? null

                        : cb.equal(root.get("source"), source);

    }

    public static Specification<Quiz> hasDifficulty(
            Resource.Difficulty difficulty
    ) {

        return (root, query, cb) ->

                difficulty == null

                        ? null

                        : cb.equal(
                        root.get("difficulty"),
                        difficulty
                );

    }

    public static Specification<Quiz> hasStatus(
            Quiz.QuizStatus status
    ) {

        return (root, query, cb) ->

                status == null

                        ? null

                        : cb.equal(
                        root.get("status"),
                        status
                );

    }

}