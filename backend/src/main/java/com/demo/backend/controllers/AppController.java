package com.demo.backend.controllers;

import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class AppController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("")
    public String viewHomePage() {
        return "index";
    }

    @PostMapping("/register")
    public String processRegister(@RequestBody User user) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        userRepository.save(user);

        return "register_success";
    }

}
