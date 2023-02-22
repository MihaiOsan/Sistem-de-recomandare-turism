package com.demo.backend.repository;

import com.demo.backend.models.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.userName = :userName")
    public Optional<User> getUserByUsername(@Param("userName") String userName);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    public Optional<User> getUserByEmail(@Param("email") String email);
}
