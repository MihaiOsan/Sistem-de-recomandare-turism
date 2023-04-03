package com.demo.backend.models.DTO;

import lombok.Data;

@Data
public class UserLocalRegisterInfo {
    private String name;
    private String email;
    private String password;
    private String phone;
}
