package com.demo.backend.models.DTO;

import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.models.entity.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class UserReturn {
    private String userName;
    private String email;
    private String phoneNumber;
    private Boolean enable;
    private String phone;
    @Enumerated(EnumType.STRING)
    private AuthenticationProvider authProvider;
}
