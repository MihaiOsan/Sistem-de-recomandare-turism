package com.demo.backend.config.services;

import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.config.models.CustomOAuth2User;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
import com.demo.backend.services.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccesHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getEmail();
        Optional<User> existingUser = userRepository.getUserByEmail(email);
        if (existingUser.isEmpty())
            userService.createOAuthUserPostLogin(email, oAuth2User.getName(), AuthenticationProvider.valueOf(oAuth2User.getClientName()));
        else if (existingUser.get().getAuthProvider() == AuthenticationProvider.LOCAL){
            userService.updateOAuthUserPostLogin(existingUser.get(), oAuth2User.getName(), AuthenticationProvider.valueOf(oAuth2User.getClientName()));
        }
        String redirectUrl = String.format("%s?email=%s", "http://localhost:4200/LogIn", email);
        response.sendRedirect(redirectUrl);
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
