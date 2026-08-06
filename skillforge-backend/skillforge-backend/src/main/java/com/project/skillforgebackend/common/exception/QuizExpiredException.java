package com.project.skillforgebackend.common.exception;

public class QuizExpiredException extends RuntimeException {

    public QuizExpiredException(String message) {
        super(message);
    }

}