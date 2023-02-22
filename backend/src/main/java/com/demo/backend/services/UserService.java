package com.demo.backend.services;

import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    public void createOAuthUserPostLogin(String email, String username, AuthenticationProvider authenticationProvider) {
        User newUser = new User();
        newUser.setUserName(username);
        newUser.setEmail(email);
        newUser.setAuthProvider(authenticationProvider);
        newUser.setEnable(true);
        newUser.setCreatedTime(ZonedDateTime.now());

        repo.save(newUser);

        System.out.println("Created new user: " + email);
    }

    public void updateOAuthUserPostLogin(User user, String username, AuthenticationProvider authenticationProvider) {
        user.setUserName(username);
        user.setAuthProvider(authenticationProvider);

        repo.save(user);

        System.out.println("Updated user: " + user.getEmail());
    }

}
