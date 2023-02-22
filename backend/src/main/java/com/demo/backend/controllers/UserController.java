package com.demo.backend.controllers;

import com.demo.backend.models.entity.User;
import com.demo.backend.models.utils.UserLocalLoginInfo;
import com.demo.backend.models.utils.UserLocalRegisterInfo;
import com.demo.backend.repository.UserRepository;
import com.demo.backend.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Base64;
import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@CrossOrigin
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;


    @GetMapping("/users")
    public List<User> getAllUsers (){
        List<User> usersList= userRepository.findAll();
        return usersList;
    }

    @RequestMapping("/login")
    public boolean login(@RequestBody User user) {
        return user.getEmail().equals("user") && user.getPassword().equals("pass");
    }

    @PostMapping(value = "/login/local")
    public ResponseEntity<User> processLogin(@RequestBody UserLocalLoginInfo userLogin){
        try{
            User userAllData = userService.userLocalLogin(userLogin);
            if (userAllData.isEnable())
                return new ResponseEntity<>(userAllData, OK);
            else
                return new ResponseEntity<>(userAllData, HttpStatusCode.valueOf(206));
        }
        catch(Exception e){
            return new ResponseEntity<>(null, HttpStatusCode.valueOf(400));
        }
    }

    @PostMapping("/register/local")
    public ResponseEntity<User> processRegister(@RequestBody UserLocalRegisterInfo userRegister) {
        try{
            return new ResponseEntity<>(userService.userLocalRegister(userRegister), HttpStatusCode.valueOf(206));
        }
        catch (Exception e){
            return new ResponseEntity<>(null, HttpStatusCode.valueOf(400));
        }
    }



    @PostMapping("/resendVerificationCode")
    public ResponseEntity<String> updateVerificationCode(@RequestBody String userEmail) {
        try{
            userService.updateUserVerificationCode(userEmail);
            return new ResponseEntity<>("Verification code updated", OK);
        }
        catch (Exception e){
            return new ResponseEntity<>("Faild to update verification code", HttpStatusCode.valueOf(400));
        }
    }

}
