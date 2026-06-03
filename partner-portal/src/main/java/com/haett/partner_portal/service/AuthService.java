package com.haett.partner_portal.service;

import com.haett.partner_portal.dto.Dtos;
import com.haett.partner_portal.entity.User;
import com.haett.partner_portal.repository.UserRepository;
import com.haett.partner_portal.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authManager,
                       UserRepository userRepository,
                       JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public Dtos.AuthResponse login(Dtos.LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());
        return new Dtos.AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name());
    }

    public User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}