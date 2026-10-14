package com.gramseva.controller;

import com.gramseva.dto.ApiResponse;
import com.gramseva.dto.DashboardStatsDto;
import com.gramseva.entity.*;
import com.gramseva.repository.PanchayatRepository;
import com.gramseva.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicController {

    private final PanchayatRepository panchayatRepository;
    private final AnnouncementService announcementService;
    private final WaterSupplyService waterSupplyService;
    private final DashboardService dashboardService;
    private final TaxBillService taxBillService;
    private final ComplaintService complaintService;
    private final PaymentService paymentService;
    private final ReceiptPdfService receiptPdfService;

    public PublicController(PanchayatRepository panchayatRepository,
                            AnnouncementService announcementService,
                            WaterSupplyService waterSupplyService,
                            DashboardService dashboardService,
                            TaxBillService taxBillService,
                            ComplaintService complaintService,
                            PaymentService paymentService,
                            ReceiptPdfService receiptPdfService) {
        this.panchayatRepository = panchayatRepository;
        this.announcementService = announcementService;
        this.waterSupplyService = waterSupplyService;
        this.dashboardService = dashboardService;
        this.taxBillService = taxBillService;
        this.complaintService = complaintService;
        this.paymentService = paymentService;
        this.receiptPdfService = receiptPdfService;
    }

    @GetMapping("/panchayat")
    public ResponseEntity<ApiResponse<Panchayat>> getPanchayatInfo() {
        Panchayat p = panchayatRepository.findAll().stream().findFirst().orElse(null);
        return ResponseEntity.ok(ApiResponse.ok(p));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok(announcementService.getActiveAnnouncements()));
    }

    @GetMapping("/water-schedules")
    public ResponseEntity<ApiResponse<List<WaterSupplySchedule>>> getWaterSchedules() {
        return ResponseEntity.ok(ApiResponse.ok(waterSupplyService.getAllSchedules()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getPublicStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardStats()));
    }

    @GetMapping("/search-bill")
    public ResponseEntity<ApiResponse<TaxBill>> searchBill(@RequestParam(required = false) String billNumber) {
        if (billNumber == null || billNumber.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Bill number is required"));
        }
        try {
            TaxBill bill = taxBillService.getBillByNumber(billNumber.trim());
            return ResponseEntity.ok(ApiResponse.ok(bill));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("No assessment bill found for number: " + billNumber));
        }
    }

    @GetMapping("/track-complaint")
    public ResponseEntity<ApiResponse<Complaint>> trackComplaint(@RequestParam String trackingNumber) {
        try {
            Complaint complaint = complaintService.getComplaintByNumber(trackingNumber.trim());
            return ResponseEntity.ok(ApiResponse.ok(complaint));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("No grievance found with tracking number: " + trackingNumber));
        }
    }

    @GetMapping("/receipts/{receiptNumber}/pdf")
    public ResponseEntity<byte[]> downloadPublicReceiptPdf(@PathVariable String receiptNumber) {
        try {
            Receipt receipt = paymentService.getReceiptByNumber(receiptNumber.trim());
            byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receipt);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getReceiptNumber() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
