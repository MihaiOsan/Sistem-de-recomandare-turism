package com.demo.backend.config;

import com.demo.backend.config.services.CustomOAuth2UserService;
import com.demo.backend.config.services.OAuth2LoginSuccesHandler;
import com.demo.backend.config.services.UserDetailsServiceImpl;
import com.demo.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new UserDetailsServiceImpl();
    }


    @Bean
    protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((auth) -> auth
                        .anyRequest().permitAll()
                )
                .httpBasic(withDefaults())
                .csrf().disable()
                .oauth2Login()
                .userInfoEndpoint()
                .userService(oauthUserService)
                .and()
                .successHandler(oAuth2LoginSuccesHandler);

        return http.build();
    }

    @Autowired
    private CustomOAuth2UserService oauthUserService;

    @Autowired
    private UserService userService;

    @Autowired
    private OAuth2LoginSuccesHandler oAuth2LoginSuccesHandler;
}
