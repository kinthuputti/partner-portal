package com.haett.partner_portal.controller;

import com.haett.partner_portal.dto.Dtos;
import com.haett.partner_portal.entity.User;
import com.haett.partner_portal.repository.UserRepository;
import com.haett.partner_portal.service.AuthService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody Dtos.LoginRequest req) {
        try { return ResponseEntity.ok(authService.login(req)); }
        catch (Exception e) { return ResponseEntity.status(401).body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setName(req.getName());
        user.setRole(User.Role.USER);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registered successfully"));
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }
}
