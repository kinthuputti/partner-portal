package com.haett.partner_portal.controller;

import com.haett.partner_portal.dto.Dtos;
import com.haett.partner_portal.entity.User;
import com.haett.partner_portal.service.ApplicationService;
import com.haett.partner_portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/partner")
public class PartnerController {

    private final ApplicationService service;
    private final AuthService authService;

    public PartnerController(ApplicationService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    // returns the user's latest application (or 204 if none)
    @GetMapping("/me")
    public ResponseEntity<?> getMyApplication(@AuthenticationPrincipal UserDetails principal) {
        User user = authService.resolveUser(principal.getUsername());
        Dtos.ApplicationResponse app = service.getMyApplication(user);
        if (app == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(app);
    }

    // submit a new application
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@AuthenticationPrincipal UserDetails principal,
                                   @Valid @RequestBody Dtos.ApplyRequest req) {
        try {
            User user = authService.resolveUser(principal.getUsername());
            return ResponseEntity.ok(service.submitApplication(user, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // reapply after rejection
    @PostMapping("/reapply")
    public ResponseEntity<?> reapply(@AuthenticationPrincipal UserDetails principal,
                                     @Valid @RequestBody Dtos.ReapplyRequest req) {
        try {
            User user = authService.resolveUser(principal.getUsername());
            return ResponseEntity.ok(service.reapply(user, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // approved partner dashboard — application + codes + stats
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@AuthenticationPrincipal UserDetails principal) {
        try {
            User user = authService.resolveUser(principal.getUsername());
            return ResponseEntity.ok(service.getDashboard(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}