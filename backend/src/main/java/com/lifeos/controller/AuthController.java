package com.lifeos.controller;

import java.util.Map;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lifeos.model.User;
import com.lifeos.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {

        String hashedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(hashedPassword);
        userRepository.save(user);

        return Map.of("message", "Registration successful");
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {

        boolean validUser = userRepository.findAll()
                .stream()
                .anyMatch(u ->
                        u.getUsername().equals(user.getUsername())
                        && passwordEncoder.matches(
                                user.getPassword(),
                                u.getPassword()
                        )
                );

        if (validUser) {
            return Map.of("message", "Login successful");
        }

        return Map.of("message", "Invalid username or password");
    }
}