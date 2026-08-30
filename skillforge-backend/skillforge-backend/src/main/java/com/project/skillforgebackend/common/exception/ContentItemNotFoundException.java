package com.project.skillforgebackend.common.exception;

public class ContentItemNotFoundException extends RuntimeException {

    public ContentItemNotFoundException(String resource, Object identifier) {
        super(String.format(
                "%s not found with identifier: %s",
                resource,
                identifier
        ));
    }
}
