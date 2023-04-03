package com.demo.backend.exceptions;

public class EmailExistException extends Exception {
    public EmailExistException(String message) {
        super(message);
    }
}
