package com.demo.backend.exceptions;

public class ValidationCodeDontMatchException extends Exception{
    public ValidationCodeDontMatchException(String message) { super(message); }
}
