package com.demo.backend.services;

import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.models.CustomOAuth2User;
import com.demo.backend.models.entity.User;
import com.demo.backend.repository.UserRepository;
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
            userService.createOAuthUserPostLogin(email, oAuth2User.getName(), AuthenticationProvider.GOOLGE);
        else{
            userService.updateOAuthUserPostLogin(existingUser.get(), oAuth2User.getName(), AuthenticationProvider.GOOLGE);
        }
        response.sendRedirect("/");
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
