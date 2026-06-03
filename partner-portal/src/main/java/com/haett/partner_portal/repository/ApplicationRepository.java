package com.haett.partner_portal.repository;

import com.haett.partner_portal.entity.ApplicationStatus;
import com.haett.partner_portal.entity.PartnerApplication;
import com.haett.partner_portal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<PartnerApplication, Long> {
    List<PartnerApplication> findByStatus(ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
    Optional<PartnerApplication> findTopByUserOrderByAppliedAtDesc(User user);
    List<PartnerApplication> findAllByOrderByAppliedAtDesc();
}
