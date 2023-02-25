package com.demo.backend.config.services;

import com.demo.backend.models.MyUserDetails;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        final Optional<User> user = userRepository.getUserByUsername(username);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("Could not find user");
        }

        return new MyUserDetails(user.get());
    }

}
