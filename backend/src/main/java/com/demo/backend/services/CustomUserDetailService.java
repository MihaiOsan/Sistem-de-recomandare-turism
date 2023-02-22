package com.demo.backend.services;

import com.demo.backend.models.MyUserDetails;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        final Optional<User> optionalUser = userRepository.getUserByUsername(username);

        if (optionalUser.isEmpty()) {
            throw new UsernameNotFoundException("Could not find user");
        }

        User user = optionalUser.get();
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassword())
                .disabled(!user.isEnable())
                .authorities("USER").build();
        return userDetails;
    }
}
