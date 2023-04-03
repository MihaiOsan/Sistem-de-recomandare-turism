package com.demo.backend.models.DTO;

import lombok.Data;

@Data
public class UserLocalLoginInfo {
    private String email;
    private String password;
}
