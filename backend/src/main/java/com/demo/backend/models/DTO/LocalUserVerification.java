package com.demo.backend.models.DTO;

import lombok.Data;

@Data
public class LocalUserVerification {
    String email;
    String code;
}
