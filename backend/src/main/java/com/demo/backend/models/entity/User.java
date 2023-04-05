package com.demo.backend.models.entity;

import com.demo.backend.models.AuthenticationProvider;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Setter
@Getter
@NoArgsConstructor
@Table(name = "user", schema = "public")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private String userName;

    @Column(length = 12)
    private String phoneNumber;

    @Column(updatable = false)
    private ZonedDateTime createdTime;

    private boolean enable;

    private String verificationCode;

    @Enumerated(EnumType.STRING)
    private AuthenticationProvider authProvider;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Plan> plansCreated;

    @ManyToMany(mappedBy = "user")
    @JsonIgnore
    private List<Plan> plansWithFriends;
}
