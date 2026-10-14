package com.gramseva.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_reference", nullable = false, unique = true, length = 80)
    private String paymentReference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id", nullable = false)
    private TaxBill bill;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "payment_mode", nullable = false, length = 30)
    private String paymentMode; // ONLINE_UPI, RAZORPAY_CARD, NET_BANKING, CASH_OFFLINE

    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;

    @Column(nullable = false, length = 20)
    private String status = "COMPLETED"; // PENDING, COMPLETED, FAILED, REFUNDED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "collected_by_user_id")
    private User collectedBy; // If offline counter payment

    @Column(length = 255)
    private String notes;

    public Payment() {
    }

    public Payment(String paymentReference, TaxBill bill, BigDecimal amount, String paymentMode,
                   String gatewayTransactionId, String status, User collectedBy, String notes) {
        this.paymentReference = paymentReference;
        this.bill = bill;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.gatewayTransactionId = gatewayTransactionId;
        this.status = status;
        this.collectedBy = collectedBy;
        this.notes = notes;
        this.paymentDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public TaxBill getBill() {
        return bill;
    }

    public void setBill(TaxBill bill) {
        this.bill = bill;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getGatewayTransactionId() {
        return gatewayTransactionId;
    }

    public void setGatewayTransactionId(String gatewayTransactionId) {
        this.gatewayTransactionId = gatewayTransactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getCollectedBy() {
        return collectedBy;
    }

    public void setCollectedBy(User collectedBy) {
        this.collectedBy = collectedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
