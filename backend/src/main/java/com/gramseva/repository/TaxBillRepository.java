package com.gramseva.repository;

import com.gramseva.entity.TaxBill;
import com.gramseva.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaxBillRepository extends JpaRepository<TaxBill, Long> {
    Optional<TaxBill> findByBillNumber(String billNumber);
    List<TaxBill> findByCitizen(Citizen citizen);
    List<TaxBill> findByCitizenId(Long citizenId);
    List<TaxBill> findByCitizenIdAndStatus(Long citizenId, String status);
    List<TaxBill> findByStatus(String status);
    List<TaxBill> findByBillType(String billType);
    List<TaxBill> findByPropertyId(Long propertyId);
    List<TaxBill> findByWaterConnectionId(Long waterConnectionId);
    List<TaxBill> findByFinancialYear(String financialYear);
    List<TaxBill> findByFinancialYearAndBillType(String financialYear, String billType);

    @Query("SELECT COUNT(b) FROM TaxBill b")
    long countTotalBills();

    @Query("SELECT COUNT(b) FROM TaxBill b WHERE b.status = 'PAID'")
    long countPaidBills();

    @Query("SELECT COUNT(b) FROM TaxBill b WHERE b.status = 'PENDING' OR b.status = 'OVERDUE'")
    long countPendingBills();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM TaxBill b")
    BigDecimal sumTotalDemand();

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM TaxBill b")
    BigDecimal sumTotalCollected();
}
