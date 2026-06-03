package com.haett.partner_portal.service;

import com.haett.partner_portal.dto.Dtos;
import com.haett.partner_portal.entity.*;
import com.haett.partner_portal.repository.ApplicationRepository;
import com.haett.partner_portal.repository.DiscountCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository repo;
    private final DiscountCodeRepository codeRepo;

    public ApplicationService(ApplicationRepository repo, DiscountCodeRepository codeRepo) {
        this.repo = repo;
        this.codeRepo = codeRepo;
    }

    // ── Partner actions ───────────────────────────────────────────────────────

    @Transactional
    public Dtos.ApplicationResponse submitApplication(User user, Dtos.ApplyRequest req) {
        // prevent duplicate pending applications
        repo.findTopByUserOrderByAppliedAtDesc(user).ifPresent(existing -> {
            if (existing.getStatus() == ApplicationStatus.PENDING) {
                throw new IllegalStateException("You already have a pending application");
            }
        });

        PartnerApplication app = new PartnerApplication();
        app.setUser(user);
        app.setPartnerType(req.getPartnerType());
        app.setBusinessName(req.getBusinessName());
        app.setPhone(req.getPhone());
        app.setSocialLink(req.getSocialLink());
        app.setAudienceSize(req.getAudienceSize());
        app.setDescription(req.getDescription());
        app.setStatus(ApplicationStatus.PENDING);
        app.setAppliedAt(LocalDateTime.now());

        return toApplicationResponse(repo.save(app));
    }

    @Transactional
    public Dtos.ApplicationResponse reapply(User user, Dtos.ReapplyRequest req) {
        PartnerApplication app = repo.findTopByUserOrderByAppliedAtDesc(user)
                .orElseThrow(() -> new RuntimeException("No application found to reapply"));

        if (app.getStatus() != ApplicationStatus.REJECTED) {
            throw new IllegalStateException("Only rejected applications can be reapplied");
        }

        app.setPartnerType(req.getPartnerType());
        app.setBusinessName(req.getBusinessName());
        app.setPhone(req.getPhone());
        app.setSocialLink(req.getSocialLink());
        app.setAudienceSize(req.getAudienceSize());
        app.setDescription(req.getDescription());
        app.setStatus(ApplicationStatus.PENDING);
        app.setRejectionReason(null);
        app.setReviewedAt(null);
        app.setAppliedAt(LocalDateTime.now());

        return toApplicationResponse(repo.save(app));
    }

    public Dtos.ApplicationResponse getMyApplication(User user) {
        return repo.findTopByUserOrderByAppliedAtDesc(user)
                .map(this::toApplicationResponse)
                .orElse(null);
    }

    // FIX: dashboard endpoint for approved partner — returns application + codes + stats
    public Dtos.DashboardResponse getDashboard(User user) {
        PartnerApplication app = repo.findTopByUserOrderByAppliedAtDesc(user)
                .orElseThrow(() -> new RuntimeException("No application found"));

        List<DiscountCode> codes = codeRepo.findByPartnerApplicationId(app.getId());

        Dtos.DashboardResponse dash = new Dtos.DashboardResponse();
        dash.setApplication(toApplicationResponse(app));
        dash.setCodes(codes.stream().map(this::toCodeResponse).collect(Collectors.toList()));
        dash.setTotalCodes(codes.size());
        dash.setTotalUsage(codes.stream().mapToInt(DiscountCode::getUsageCount).sum());
        dash.setTotalDiscountGiven(totalDiscountGiven(codes));

        return dash;
    }

    // ── Admin actions ─────────────────────────────────────────────────────────

    public List<Dtos.ApplicationResponse> getAll() {
        return repo.findAllByOrderByAppliedAtDesc()
                .stream().map(this::toApplicationResponse).collect(Collectors.toList());
    }

    public List<Dtos.ApplicationResponse> getByStatus(ApplicationStatus status) {
        return repo.findByStatus(status)
                .stream().map(this::toApplicationResponse).collect(Collectors.toList());
    }

    // FIX: returns CountsResponse DTO — no path conflict with /applications/{status}
    public Dtos.CountsResponse getCounts() {
        Dtos.CountsResponse c = new Dtos.CountsResponse();
        c.setPending(repo.countByStatus(ApplicationStatus.PENDING));
        c.setApproved(repo.countByStatus(ApplicationStatus.APPROVED));
        c.setRejected(repo.countByStatus(ApplicationStatus.REJECTED));
        c.setAll(repo.count());
        return c;
    }

    @Transactional
    public Dtos.ApplicationResponse approve(Long id) {
        PartnerApplication app = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be approved");
        }

        app.setStatus(ApplicationStatus.APPROVED);
        app.setReviewedAt(LocalDateTime.now());
        repo.save(app);

        // auto-create discount code on approval
        DiscountCode code = new DiscountCode();
        code.setCode(generateCode(app.getBusinessName()));
        code.setDiscountValue("20% OFF");
        code.setActive(true);
        code.setUsageCount(0);
        code.setExpiryDate(LocalDate.now().plusMonths(6));
        code.setPartnerApplication(app);
        codeRepo.save(code);

        return toApplicationResponse(app);
    }

    // FIX: reason comes from RejectRequest body, not @RequestParam
    @Transactional
    public Dtos.ApplicationResponse reject(Long id, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        PartnerApplication app = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be rejected");
        }

        app.setStatus(ApplicationStatus.REJECTED);
        app.setRejectionReason(reason);
        app.setReviewedAt(LocalDateTime.now());

        return toApplicationResponse(repo.save(app));
    }

    public Dtos.CodeResponse toggleCode(Long id) {
        DiscountCode code = codeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount code not found: " + id));

        if (isExpired(code)) {
            throw new IllegalStateException("Cannot toggle an expired code");
        }

        code.setActive(!code.isActive());
        return toCodeResponse(codeRepo.save(code));
    }

    public Dtos.CodeResponse incrementUsage(Long id) {
        DiscountCode code = codeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount code not found: " + id));

        if (isExpired(code)) {
            throw new IllegalStateException("Discount code has expired");
        }
        if (!code.isActive()) {
            throw new IllegalStateException("Discount code is inactive");
        }

        code.setUsageCount(code.getUsageCount() + 1);
        return toCodeResponse(codeRepo.save(code));
    }

    public List<Dtos.CodeResponse> getCodesForApplication(Long appId) {
        return codeRepo.findByPartnerApplicationId(appId)
                .stream().map(this::toCodeResponse).collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean isExpired(DiscountCode code) {
        return code.getExpiryDate() != null && code.getExpiryDate().isBefore(LocalDate.now());
    }

    private double totalDiscountGiven(List<DiscountCode> codes) {
        return codes.stream().mapToDouble(code -> {
            int usage = code.getUsageCount();
            String value = code.getDiscountValue();
            if (value == null) return 0;
            if (value.contains("%")) {
                double pct = Double.parseDouble(value.replaceAll("[^0-9.]", ""));
                return usage * pct;
            }
            if (value.toUpperCase().contains("OFF")) {
                double amount = Double.parseDouble(value.replaceAll("[^0-9.]", ""));
                return usage * amount;
            }
            return 0;
        }).sum();
    }

    private String generateCode(String businessName) {
        return businessName.toUpperCase().replaceAll("\\s+", "") + "20";
    }

    private Dtos.ApplicationResponse toApplicationResponse(PartnerApplication app) {
        Dtos.ApplicationResponse r = new Dtos.ApplicationResponse();
        r.setId(app.getId());
        r.setUserName(app.getUser().getName());
        r.setUserEmail(app.getUser().getEmail());
        r.setPartnerType(app.getPartnerType());
        r.setBusinessName(app.getBusinessName());
        r.setPhone(app.getPhone());
        r.setSocialLink(app.getSocialLink());
        r.setAudienceSize(app.getAudienceSize());
        r.setDescription(app.getDescription());
        r.setStatus(app.getStatus());
        r.setRejectionReason(app.getRejectionReason());
        r.setAppliedAt(app.getAppliedAt());
        r.setReviewedAt(app.getReviewedAt());
        return r;
    }

    private Dtos.CodeResponse toCodeResponse(DiscountCode code) {
        Dtos.CodeResponse r = new Dtos.CodeResponse();
        r.setId(code.getId());
        r.setCode(code.getCode());
        r.setDiscountValue(code.getDiscountValue());
        r.setActive(code.isActive());
        r.setUsageCount(code.getUsageCount());
        r.setExpiryDate(code.getExpiryDate());
        return r;
    }
}