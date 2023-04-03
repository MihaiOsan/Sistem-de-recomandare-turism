package com.demo.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    JavaMailSender mailSender;

    public void sendEmail(String toEmail, String subject, String body){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("tripmaker2022.2023@gmail.com");
        mailMessage.setTo(toEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(body);

        mailSender.send(mailMessage);

        System.out.println("Mail sent");
    }

}
