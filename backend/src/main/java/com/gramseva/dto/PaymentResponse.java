package com.gramseva.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private String paymentReference;
    private Long billId;
    private String billNumber;
    private String billType;
    private BigDecimal amount;
    private String status;
    private String paymentMode;
    private LocalDateTime paymentDate;
    private String receiptNumber;
    private String receiptUrl;

    public PaymentResponse() {
    }

    public PaymentResponse(String paymentReference, Long billId, String billNumber, String billType,
                           BigDecimal amount, String status, String paymentMode, LocalDateTime paymentDate,
                           String receiptNumber, String receiptUrl) {
        this.paymentReference = paymentReference;
        this.billId = billId;
        this.billNumber = billNumber;
        this.billType = billType;
        this.amount = amount;
        this.status = status;
        this.paymentMode = paymentMode;
        this.paymentDate = paymentDate;
        this.receiptNumber = receiptNumber;
        this.receiptUrl = receiptUrl;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public String getBillType() {
        return billType;
    }

    public void setBillType(String billType) {
        this.billType = billType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}
