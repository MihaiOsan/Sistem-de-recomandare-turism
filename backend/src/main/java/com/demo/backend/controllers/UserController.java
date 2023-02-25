package com.demo.backend.controllers;

import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class UserController {

    @Autowired
    UserRepository userRepository;


    @GetMapping("/users")
    public List<User> getAllUsers (){
        List<User> usersList= userRepository.findAll();
        return usersList;
    }
}
