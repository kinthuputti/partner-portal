package com.haett.partner_portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "discount_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String discountValue;  // e.g. "20% OFF" or "₹500 OFF"

    private boolean active;

    private int usageCount;

    private LocalDate expiryDate;

    // FIX: @JsonIgnoreProperties prevents infinite recursion when serialising
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "discountCodes", "user"})
    private PartnerApplication partnerApplication;
}