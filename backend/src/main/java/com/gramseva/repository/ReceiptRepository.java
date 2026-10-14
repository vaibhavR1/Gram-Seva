package com.gramseva.repository;

import com.gramseva.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
    Optional<Receipt> findByPaymentId(Long paymentId);
    List<Receipt> findByBillCitizenId(Long citizenId);
    List<Receipt> findTop20ByOrderByIssuedDateDesc();
    Optional<Receipt> findTopByBillIdOrderByIdDesc(Long billId);
}
