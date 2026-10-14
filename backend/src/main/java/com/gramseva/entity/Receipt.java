package com.gramseva.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "receipts")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 60)
    private String receiptNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bill_id", nullable = false)
    private TaxBill bill;

    @Column(name = "issued_date", nullable = false)
    private LocalDateTime issuedDate = LocalDateTime.now();

    @Column(name = "verification_hash", length = 100)
    private String verificationHash;

    public Receipt() {
    }

    public Receipt(String receiptNumber, Payment payment, TaxBill bill, String verificationHash) {
        this.receiptNumber = receiptNumber;
        this.payment = payment;
        this.bill = bill;
        this.verificationHash = verificationHash;
        this.issuedDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public TaxBill getBill() {
        return bill;
    }

    public void setBill(TaxBill bill) {
        this.bill = bill;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }

    public String getVerificationHash() {
        return verificationHash;
    }

    public void setVerificationHash(String verificationHash) {
        this.verificationHash = verificationHash;
    }
}
