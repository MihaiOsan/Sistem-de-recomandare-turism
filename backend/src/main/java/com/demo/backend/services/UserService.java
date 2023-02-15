package com.demo.backend.services;

import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    public void processOAuthPostLogin(String username) {
        User existUser = repo.getUserByUsername(username);

        if (existUser == null) {
            User newUser = new User();
            newUser.setUserName(username);
            newUser.setAuthProvider(AuthenticationProvider.GOOLGE);
            newUser.setEnable(true);

            repo.save(newUser);

            System.out.println("Created new user: " + username);
        }

    }

}
