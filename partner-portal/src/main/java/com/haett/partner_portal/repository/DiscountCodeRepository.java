package com.haett.partner_portal.repository;

import com.haett.partner_portal.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    List<DiscountCode> findByPartnerApplicationId(Long id);
}