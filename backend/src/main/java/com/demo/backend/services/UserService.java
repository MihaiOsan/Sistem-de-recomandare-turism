package com.demo.backend.services;

import com.demo.backend.exceptions.AuthProviderException;
import com.demo.backend.exceptions.EmailExistException;
import com.demo.backend.exceptions.UserNotFoundException;
import com.demo.backend.exceptions.ValidationCodeDontMatchException;
import com.demo.backend.models.AuthenticationProvider;
import com.demo.backend.models.entity.User;
import com.demo.backend.models.DTO.UserLocalLoginInfo;
import com.demo.backend.models.DTO.UserLocalRegisterInfo;
import com.demo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;

    @Lazy
    @Autowired
    private PasswordEncoder passwordEncoder;

    public void createOAuthUserPostLogin(String email, String username, AuthenticationProvider authenticationProvider) {
        User newUser = new User();
        newUser.setUserName(username);
        newUser.setEmail(email);
        newUser.setAuthProvider(authenticationProvider);
        newUser.setEnable(true);
        newUser.setCreatedTime(ZonedDateTime.now());

        userRepository.save(newUser);

        System.out.println("Created new user: " + email);
    }

    public void updateOAuthUserPostLogin(User user, String username, AuthenticationProvider authenticationProvider) {
        user.setUserName(username);
        user.setAuthProvider(authenticationProvider);

        userRepository.save(user);

        System.out.println("Updated user: " + user.getEmail());
    }

    public User userLocalLogin(UserLocalLoginInfo userLogin) throws UserNotFoundException {
        Optional<User> user = userRepository.getUserByEmail(userLogin.getEmail());
        if (user.isPresent()&& passwordEncoder.matches(userLogin.getPassword(), user.get().getPassword()) && user.get().getAuthProvider() == AuthenticationProvider.LOCAL)
            return user.get();
        else{
            throw new UserNotFoundException("Could not find a user with this email and password");
        }
    }

    public User userLocalRegister(UserLocalRegisterInfo userRegister) throws EmailExistException{
        Optional<User> userO = userRepository.getUserByEmail(userRegister.getEmail());
        if (userO.isEmpty()){
            User newUser = new User();
            newUser.setUserName(userRegister.getName());
            newUser.setEmail(userRegister.getEmail());
            newUser.setAuthProvider(AuthenticationProvider.LOCAL);
            newUser.setEnable(false);
            newUser.setCreatedTime(ZonedDateTime.now());

            String encodedPassword = passwordEncoder.encode(userRegister.getPassword());
            newUser.setPassword(encodedPassword);

            String validationCode = generateCode();
            String subject = "Account activation";
            String body = "In order to finalise account creation, please introduce the next code into the designated field after registering:\n\n"+ validationCode;

            emailService.sendEmail(newUser.getEmail(), subject, body);

            newUser.setVerificationCode(passwordEncoder.encode(validationCode));

            userRepository.save(newUser);
            System.out.println("Created user: " + newUser.getEmail());
            return newUser;
        }
        else
            throw new EmailExistException("User with this email already exist");
    }

    public void userLocalRegisterVerification(String email, String code) throws UserNotFoundException, ValidationCodeDontMatchException, AuthProviderException {
        Optional<User> userO = userRepository.getUserByEmail(email);
        if(!userO.get().isEnable()){
        if (userO.isEmpty()){
            throw new UserNotFoundException("Could not find a user with this email");
        }
        else if (userO.get().getAuthProvider() != AuthenticationProvider.LOCAL){
            throw new AuthProviderException("Could not validate this type of account");
        }
        else if (passwordEncoder.matches(code, userO.get().getVerificationCode())){
            User user = userO.get();
            user.setEnable(true);
            userRepository.save(user);
        }
        else{
            throw new ValidationCodeDontMatchException("Validation code not match");
        }}
    }

    public void updateUserVerificationCode(String userEmail){
        System.out.println(userEmail);
        Optional<User> userO = userRepository.getUserByEmail(userEmail);
        if (userO.isPresent() && userO.get().getAuthProvider() == AuthenticationProvider.LOCAL) {
            User user = userO.get();
            String validationCode = generateCode();
            String subject = "Account activation";
            String body = "In order to finalise account creation, please introduce the next code into the designated field after registering:\n\n"+ validationCode;

            emailService.sendEmail(user.getEmail(), subject, body);

            user.setVerificationCode(passwordEncoder.encode(validationCode));
            userRepository.save(user);
            System.out.println("Updated verification code for user: " + user.getEmail());
        }
        else
            throw new RuntimeException("User verification code not updated");
    }

    public String generateCode(){
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            int index = random.nextInt(characters.length());
            codeBuilder.append(characters.charAt(index));
        }
        return codeBuilder.toString();
    }
}
