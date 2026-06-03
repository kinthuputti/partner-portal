package com.haett.partner_portal.dto;

import com.haett.partner_portal.entity.ApplicationStatus;
import com.haett.partner_portal.entity.DiscountCode;
import com.haett.partner_portal.entity.PartnerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    // ── Auth ──────────────────────────────────────────────────────────────────

    @Data
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;

        public AuthResponse(String token, String email, String name, String role) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.role = role;
        }
    }

    // ── Application ───────────────────────────────────────────────────────────

    @Data
    public static class ApplyRequest {
        @NotNull  private PartnerType partnerType;
        @NotBlank private String businessName;
        private String phone;
        private String socialLink;
        private Integer audienceSize;
        private String description;
    }

    @Data
    public static class ReapplyRequest {
        @NotNull  private PartnerType partnerType;
        @NotBlank private String businessName;
        private String phone;
        private String socialLink;
        private Integer audienceSize;
        private String description;
    }

    // FIX: reason as JSON body, not query param
    @Data
    public static class RejectRequest {
        @NotBlank private String reason;
    }

    @Data
    public static class ApplicationResponse {
        private Long id;
        private String userName;
        private String userEmail;
        private PartnerType partnerType;
        private String businessName;
        private String phone;
        private String socialLink;
        private Integer audienceSize;
        private String description;
        private ApplicationStatus status;
        private String rejectionReason;
        private LocalDateTime appliedAt;
        private LocalDateTime reviewedAt;
    }

    // ── Discount code ─────────────────────────────────────────────────────────

    @Data
    public static class CodeResponse {
        private Long id;
        private String code;
        private String discountValue;
        private boolean active;
        private int usageCount;
        private LocalDate expiryDate;
    }

    // ── Dashboard (approved partner view) ─────────────────────────────────────

    @Data
    public static class DashboardResponse {
        private ApplicationResponse application;
        private List<CodeResponse> codes;
        private int totalCodes;
        private int totalUsage;
        private double totalDiscountGiven;
    }

    // ── Admin counts ──────────────────────────────────────────────────────────

    @Data
    public static class CountsResponse {
        private long pending;
        private long approved;
        private long rejected;
        private long all;
    }
}