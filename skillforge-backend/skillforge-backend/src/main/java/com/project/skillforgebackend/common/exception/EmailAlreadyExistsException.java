package com.project.skillforgebackend.common.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException() {
        // Deliberately generic — never echo the email back to the client
        // (prevents account enumeration via the register endpoint).
        super("Email already registered.");
    }
}