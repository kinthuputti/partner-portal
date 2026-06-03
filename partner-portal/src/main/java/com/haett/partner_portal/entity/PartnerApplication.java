package com.haett.partner_portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PartnerApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FIX: linked to User instead of storing email directly
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PartnerType partnerType;

    @NotNull
    private String businessName;

    private String phone;

    private String socialLink;

    private Integer audienceSize;

    @Column(length = 500)
    private String description;

    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private String rejectionReason;

    private LocalDateTime reviewedAt;
}