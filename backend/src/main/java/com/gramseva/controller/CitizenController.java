package com.gramseva.controller;

import com.gramseva.dto.ApiResponse;
import com.gramseva.dto.ComplaintRequest;
import com.gramseva.dto.PaymentRequest;
import com.gramseva.dto.PaymentResponse;
import com.gramseva.entity.*;
import com.gramseva.repository.*;
import com.gramseva.security.UserPrincipal;
import com.gramseva.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen")
public class CitizenController {

    private final CitizenRepository citizenRepository;
    private final PropertyRepository propertyRepository;
    private final WaterConnectionRepository waterConnectionRepository;
    private final TaxBillService taxBillService;
    private final PaymentService paymentService;
    private final ReceiptPdfService receiptPdfService;
    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    public CitizenController(CitizenRepository citizenRepository,
                             PropertyRepository propertyRepository,
                             WaterConnectionRepository waterConnectionRepository,
                             TaxBillService taxBillService,
                             PaymentService paymentService,
                             ReceiptPdfService receiptPdfService,
                             ComplaintService complaintService,
                             UserRepository userRepository) {
        this.citizenRepository = citizenRepository;
        this.propertyRepository = propertyRepository;
        this.waterConnectionRepository = waterConnectionRepository;
        this.taxBillService = taxBillService;
        this.paymentService = paymentService;
        this.receiptPdfService = receiptPdfService;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
    }

    private Citizen getCitizenFromPrincipal(UserPrincipal principal) {
        return citizenRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new RuntimeException("Citizen record not found for logged in user"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Citizen>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        return ResponseEntity.ok(ApiResponse.ok(citizen));
    }

    @GetMapping("/properties")
    public ResponseEntity<ApiResponse<List<Property>>> getMyProperties(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<Property> properties = propertyRepository.findByOwner(citizen);
        return ResponseEntity.ok(ApiResponse.ok(properties));
    }

    @GetMapping("/water-connections")
    public ResponseEntity<ApiResponse<List<WaterConnection>>> getMyWaterConnections(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<WaterConnection> connections = waterConnectionRepository.findByCitizen(citizen);
        return ResponseEntity.ok(ApiResponse.ok(connections));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<TaxBill>>> getMyBills(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<TaxBill> bills = taxBillService.getBillsByCitizenId(citizen.getId());
        return ResponseEntity.ok(ApiResponse.ok(bills));
    }

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> payBill(@AuthenticationPrincipal UserPrincipal principal,
                                                                @Valid @RequestBody PaymentRequest request) {
        User user = userRepository.findById(principal.getId()).orElse(null);
        PaymentResponse response = paymentService.processPayment(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Payment processed successfully", response));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<Payment> payments = paymentService.getPaymentsByCitizen(citizen.getId());
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping("/receipts")
    public ResponseEntity<ApiResponse<List<Receipt>>> getMyReceipts(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<Receipt> receipts = paymentService.getReceiptsByCitizen(citizen.getId());
        return ResponseEntity.ok(ApiResponse.ok(receipts));
    }

    @GetMapping("/receipts/{receiptId}/pdf")
    public ResponseEntity<byte[]> downloadReceiptPdf(@PathVariable Long receiptId) {
        Receipt receipt = paymentService.getReceiptById(receiptId);
        byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receipt);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getReceiptNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/bills/{billId}/receipt/pdf")
    public ResponseEntity<byte[]> downloadReceiptPdfByBill(@PathVariable Long billId) {
        Receipt receipt = paymentService.getReceiptByBillId(billId);
        byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receipt);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getReceiptNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/receipts/number/{receiptNumber}/pdf")
    public ResponseEntity<byte[]> downloadReceiptPdfByNumber(@PathVariable String receiptNumber) {
        Receipt receipt = paymentService.getReceiptByNumber(receiptNumber);
        byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receipt);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + receipt.getReceiptNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<Complaint>>> getMyComplaints(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = getCitizenFromPrincipal(principal);
        List<Complaint> complaints = complaintService.getComplaintsByCitizenId(citizen.getId());
        return ResponseEntity.ok(ApiResponse.ok(complaints));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<Complaint>> submitComplaint(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @Valid @RequestBody ComplaintRequest request) {
        User user = userRepository.findById(principal.getId()).orElse(null);
        Complaint complaint = complaintService.submitComplaint(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Grievance registered successfully", complaint));
    }
}
