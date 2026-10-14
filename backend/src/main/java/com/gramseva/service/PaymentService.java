package com.gramseva.service;

import com.gramseva.dto.PaymentRequest;
import com.gramseva.dto.PaymentResponse;
import com.gramseva.entity.*;
import com.gramseva.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TaxBillRepository taxBillRepository;
    private final ReceiptRepository receiptRepository;
    private final AuditLogRepository auditLogRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          TaxBillRepository taxBillRepository,
                          ReceiptRepository receiptRepository,
                          AuditLogRepository auditLogRepository) {
        this.paymentRepository = paymentRepository;
        this.taxBillRepository = taxBillRepository;
        this.receiptRepository = receiptRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, User currentUser) {
        TaxBill bill = taxBillRepository.findById(request.getBillId())
                .orElseThrow(() -> new RuntimeException("Tax bill not found with id: " + request.getBillId()));

        if ("PAID".equalsIgnoreCase(bill.getStatus())) {
            throw new RuntimeException("Bill " + bill.getBillNumber() + " is already fully paid!");
        }

        // Generate unique payment reference
        String paymentRef = "PAY-" + System.currentTimeMillis() % 10000000;
        String gatewayTxnId = request.getGatewayTransactionId() != null
                ? request.getGatewayTransactionId()
                : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment(
                paymentRef,
                bill,
                request.getAmount(),
                request.getPaymentMode() != null ? request.getPaymentMode() : "ONLINE_UPI",
                gatewayTxnId,
                "COMPLETED",
                currentUser != null && currentUser.getRole() != Role.CITIZEN ? currentUser : null,
                request.getNotes()
        );
        payment = paymentRepository.save(payment);

        // Update bill status
        bill.setPaidAmount(bill.getPaidAmount().add(request.getAmount()));
        if (bill.getPaidAmount().compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus("PAID");
        } else {
            bill.setStatus("PARTIALLY_PAID");
        }
        taxBillRepository.save(bill);

        // Generate digital receipt
        String receiptNo = "RCPT-" + LocalDateTime.now().getYear() + "-" + (10000 + payment.getId());
        String verificationHash = "VER-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Receipt receipt = new Receipt(receiptNo, payment, bill, verificationHash);
        receipt = receiptRepository.save(receipt);

        // Log audit
        AuditLog auditLog = new AuditLog(
                "TAX_PAYMENT_PROCESSED",
                "Payment",
                payment.getId(),
                currentUser,
                "127.0.0.1",
                "Payment of Rs. " + payment.getAmount() + " processed for bill " + bill.getBillNumber() + ". Receipt issued: " + receiptNo
        );
        auditLogRepository.save(auditLog);

        return new PaymentResponse(
                paymentRef,
                bill.getId(),
                bill.getBillNumber(),
                bill.getBillType(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getPaymentMode(),
                payment.getPaymentDate(),
                receipt.getReceiptNumber(),
                "/api/citizen/receipts/" + receipt.getId() + "/pdf"
        );
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByCitizen(Long citizenId) {
        return paymentRepository.findByBillCitizenId(citizenId);
    }

    public List<Receipt> getReceiptsByCitizen(Long citizenId) {
        return receiptRepository.findByBillCitizenId(citizenId);
    }

    public Receipt getReceiptById(Long receiptId) {
        return receiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Receipt not found with id: " + receiptId));
    }

    public Receipt getReceiptByNumber(String receiptNumber) {
        return receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found with number: " + receiptNumber));
    }

    public Receipt getReceiptByBillId(Long billId) {
        return receiptRepository.findTopByBillIdOrderByIdDesc(billId)
                .orElseGet(() -> {
                    TaxBill bill = taxBillRepository.findById(billId)
                            .orElseThrow(() -> new RuntimeException("Tax bill not found: " + billId));
                    if ("PAID".equalsIgnoreCase(bill.getStatus())) {
                        Payment payment = paymentRepository.findTopByBillIdOrderByIdDesc(billId)
                                .orElseGet(() -> {
                                    Payment p = new Payment("PAY-" + System.currentTimeMillis(), bill, bill.getPaidAmount() != null ? bill.getPaidAmount() : bill.getTotalAmount(),
                                            "ONLINE_UPI", "REF-" + System.currentTimeMillis(), "COMPLETED", null, "Official Tax Payment");
                                    return paymentRepository.save(p);
                                });
                        String receiptNo = "RCPT-" + (bill.getFinancialYear() != null && bill.getFinancialYear().length() >= 4 ? bill.getFinancialYear().substring(0, 4) : "2026") + "-" + (1000 + bill.getId());
                        Receipt r = new Receipt(receiptNo, payment, bill, "VER-HASH-" + bill.getId() + "-" + System.currentTimeMillis());
                        return receiptRepository.save(r);
                    }
                    throw new RuntimeException("No receipt issued yet for unpaid bill " + bill.getBillNumber());
                });
    }
}
