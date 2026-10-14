package com.gramseva.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PaymentRequest {

    @NotNull(message = "Bill ID is required")
    private Long billId;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String paymentMode = "ONLINE_UPI"; // ONLINE_UPI, RAZORPAY_CARD, NET_BANKING, CASH_OFFLINE
    private String gatewayTransactionId; // Razorpay payment id or UPI txn id
    private String notes;

    public PaymentRequest() {
    }

    public PaymentRequest(Long billId, BigDecimal amount, String paymentMode, String gatewayTransactionId, String notes) {
        this.billId = billId;
        this.amount = amount;
        this.paymentMode = paymentMode;
        this.gatewayTransactionId = gatewayTransactionId;
        this.notes = notes;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
