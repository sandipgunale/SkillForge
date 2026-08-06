package com.project.skillforgebackend.ai.guardrail;

public class QuestionQuotaExceededException extends RuntimeException {

    public QuestionQuotaExceededException(String message) {
        super(message);
    }

}