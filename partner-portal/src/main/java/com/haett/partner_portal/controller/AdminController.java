package com.haett.partner_portal.controller;

import com.haett.partner_portal.dto.Dtos;
import com.haett.partner_portal.entity.ApplicationStatus;
import com.haett.partner_portal.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ApplicationService service;

    public AdminController(ApplicationService service) {
        this.service = service;
    }

    // all applications (newest first)
    @GetMapping("/applications")
    public List<Dtos.ApplicationResponse> all() {
        return service.getAll();
    }

    // filter by status
    @GetMapping("/applications/status/{status}")
    public List<Dtos.ApplicationResponse> byStatus(@PathVariable ApplicationStatus status) {
        return service.getByStatus(status);
    }

    // FIX: moved to /admin/counts — no longer clashes with /applications/{status}
    @GetMapping("/counts")
    public Dtos.CountsResponse counts() {
        return service.getCounts();
    }

    // approve application
    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.approve(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // FIX: reason as JSON body { "reason": "..." } instead of ?reason=
    @PostMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id,
                                    @Valid @RequestBody Dtos.RejectRequest req) {
        try {
            return ResponseEntity.ok(service.reject(id, req.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // toggle code active/inactive
    @PostMapping("/code/toggle/{id}")
    public ResponseEntity<?> toggleCode(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.toggleCode(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // increment usage count (for testing/simulation)
    @PostMapping("/code/use/{id}")
    public ResponseEntity<?> useCode(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.incrementUsage(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // get codes for a specific application
    @GetMapping("/codes/{appId}")
    public List<Dtos.CodeResponse> codesForApplication(@PathVariable Long appId) {
        return service.getCodesForApplication(appId);
    }
}