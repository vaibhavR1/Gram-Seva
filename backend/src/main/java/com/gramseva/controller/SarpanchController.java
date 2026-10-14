package com.gramseva.controller;

import com.gramseva.dto.ApiResponse;
import com.gramseva.dto.DashboardStatsDto;
import com.gramseva.entity.*;
import com.gramseva.repository.*;
import com.gramseva.security.UserPrincipal;
import com.gramseva.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sarpanch")
public class SarpanchController {

    private final DashboardService dashboardService;
    private final CitizenRepository citizenRepository;
    private final PropertyRepository propertyRepository;
    private final TaxBillService taxBillService;
    private final PaymentService paymentService;
    private final ComplaintService complaintService;
    private final AnnouncementService announcementService;
    private final UserRepository userRepository;

    public SarpanchController(DashboardService dashboardService,
                              CitizenRepository citizenRepository,
                              PropertyRepository propertyRepository,
                              TaxBillService taxBillService,
                              PaymentService paymentService,
                              ComplaintService complaintService,
                              AnnouncementService announcementService,
                              UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.citizenRepository = citizenRepository;
        this.propertyRepository = propertyRepository;
        this.taxBillService = taxBillService;
        this.paymentService = paymentService;
        this.complaintService = complaintService;
        this.announcementService = announcementService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardStats()));
    }

    @GetMapping("/citizens")
    public ResponseEntity<ApiResponse<List<Citizen>>> getCitizens() {
        return ResponseEntity.ok(ApiResponse.ok(citizenRepository.findAll()));
    }

    @GetMapping("/properties")
    public ResponseEntity<ApiResponse<List<Property>>> getProperties() {
        return ResponseEntity.ok(ApiResponse.ok(propertyRepository.findAll()));
    }

    @PostMapping("/properties")
    public ResponseEntity<ApiResponse<Property>> createProperty(@RequestBody Property property) {
        if (property.getPropertyNumber() == null || property.getPropertyNumber().isBlank()) {
            property.setPropertyNumber("GP-PROP-" + (1000 + propertyRepository.count() + 1));
        }
        Property saved = propertyRepository.save(property);
        return ResponseEntity.ok(ApiResponse.ok("Property registered successfully", saved));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<TaxBill>>> getBills() {
        return ResponseEntity.ok(ApiResponse.ok(taxBillService.getAllBills()));
    }

    @PostMapping("/bills/generate-house-tax")
    public ResponseEntity<ApiResponse<TaxBill>> generateHouseTax(@RequestBody Map<String, Object> payload) {
        Long propertyId = Long.valueOf(payload.get("propertyId").toString());
        String financialYear = payload.getOrDefault("financialYear", "2026-2027").toString();
        LocalDate dueDate = payload.containsKey("dueDate")
                ? LocalDate.parse(payload.get("dueDate").toString())
                : LocalDate.now().plusMonths(3);

        TaxBill bill = taxBillService.createHouseTaxBill(propertyId, financialYear, dueDate);
        return ResponseEntity.ok(ApiResponse.ok("House Tax Assessment Bill generated", bill));
    }

    @PostMapping("/bills/generate-water-tax")
    public ResponseEntity<ApiResponse<TaxBill>> generateWaterTax(@RequestBody Map<String, Object> payload) {
        Long connectionId = Long.valueOf(payload.get("connectionId").toString());
        String financialYear = payload.getOrDefault("financialYear", "2026-2027").toString();
        LocalDate dueDate = payload.containsKey("dueDate")
                ? LocalDate.parse(payload.get("dueDate").toString())
                : LocalDate.now().plusMonths(3);

        TaxBill bill = taxBillService.createWaterTaxBill(connectionId, financialYear, dueDate);
        return ResponseEntity.ok(ApiResponse.ok("Water Tax Assessment Bill generated", bill));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<Complaint>>> getComplaints() {
        return ResponseEntity.ok(ApiResponse.ok(complaintService.getAllComplaints()));
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ApiResponse<Complaint>> assignComplaint(@PathVariable Long id,
                                                                  @RequestBody Map<String, Long> payload) {
        Long staffId = payload.get("staffId");
        Complaint c = complaintService.assignStaff(id, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Staff assigned to complaint", c));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<Complaint>> updateComplaintStatus(@PathVariable Long id,
                                                                        @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String notes = payload.get("notes");
        Complaint c = complaintService.updateStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.ok("Complaint status updated", c));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok(announcementService.getAllAnnouncements()));
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@AuthenticationPrincipal UserPrincipal principal,
                                                                        @RequestBody Announcement announcement) {
        User author = userRepository.findById(principal.getId()).orElse(null);
        Announcement saved = announcementService.createAnnouncement(announcement, author);
        return ResponseEntity.ok(ApiResponse.ok("Announcement published successfully", saved));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Announcement removed", null));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getPayments() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPayments()));
    }
}
