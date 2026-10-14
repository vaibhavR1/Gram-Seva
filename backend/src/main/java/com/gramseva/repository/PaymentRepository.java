package com.gramseva.repository;

import com.gramseva.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    List<Payment> findByBillId(Long billId);
    Optional<Payment> findTopByBillIdOrderByIdDesc(Long billId);
    List<Payment> findByBillCitizenId(Long citizenId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal sumTotalSuccessfulPayments();

    List<Payment> findTop10ByOrderByPaymentDateDesc();
}
