package com.project.skillforgebackend.common.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super(String.format(
                "%s not found with identifier: %s",
                resource,
                identifier
        ));
    }

}