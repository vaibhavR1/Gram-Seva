package com.gramseva.service;

import com.gramseva.entity.Citizen;
import com.gramseva.entity.Property;
import com.gramseva.entity.TaxBill;
import com.gramseva.entity.WaterConnection;
import com.gramseva.repository.CitizenRepository;
import com.gramseva.repository.PropertyRepository;
import com.gramseva.repository.TaxBillRepository;
import com.gramseva.repository.WaterConnectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TaxBillService {

    private final TaxBillRepository taxBillRepository;
    private final PropertyRepository propertyRepository;
    private final WaterConnectionRepository waterConnectionRepository;
    private final CitizenRepository citizenRepository;

    public TaxBillService(TaxBillRepository taxBillRepository,
                          PropertyRepository propertyRepository,
                          WaterConnectionRepository waterConnectionRepository,
                          CitizenRepository citizenRepository) {
        this.taxBillRepository = taxBillRepository;
        this.propertyRepository = propertyRepository;
        this.waterConnectionRepository = waterConnectionRepository;
        this.citizenRepository = citizenRepository;
    }

    public List<TaxBill> getAllBills() {
        return taxBillRepository.findAll();
    }

    public List<TaxBill> getBillsByCitizenId(Long citizenId) {
        return taxBillRepository.findByCitizenId(citizenId);
    }

    public List<TaxBill> getPendingBillsByCitizenId(Long citizenId) {
        return taxBillRepository.findByCitizenIdAndStatus(citizenId, "PENDING");
    }

    public TaxBill getBillById(Long billId) {
        return taxBillRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Tax bill not found with id: " + billId));
    }

    public TaxBill getBillByNumber(String billNumber) {
        return taxBillRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new RuntimeException("Tax bill not found with number: " + billNumber));
    }

    @Transactional
    public TaxBill createHouseTaxBill(Long propertyId, String financialYear, LocalDate dueDate) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        Citizen citizen = property.getOwner();
        String billNo = "TB-HT-" + LocalDate.now().getYear() + "-" + (1000 + taxBillRepository.count() + 1);

        BigDecimal base = property.getAnnualTaxAmount();
        BigDecimal total = base;

        TaxBill bill = new TaxBill(
                billNo,
                "HOUSE_TAX",
                property,
                null,
                citizen,
                property.getPanchayat(),
                financialYear,
                LocalDate.now(),
                dueDate,
                base,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                total,
                BigDecimal.ZERO,
                "PENDING",
                "Annual Gram Panchayat House Tax Assessment"
        );

        return taxBillRepository.save(bill);
    }

    @Transactional
    public TaxBill createWaterTaxBill(Long waterConnectionId, String financialYear, LocalDate dueDate) {
        WaterConnection connection = waterConnectionRepository.findById(waterConnectionId)
                .orElseThrow(() -> new RuntimeException("Water connection not found with id: " + waterConnectionId));

        Citizen citizen = connection.getCitizen();
        String billNo = "TB-WT-" + LocalDate.now().getYear() + "-" + (2000 + taxBillRepository.count() + 1);

        // Annual charge = 12 * monthly rate
        BigDecimal base = connection.getMonthlyRate().multiply(BigDecimal.valueOf(12));
        BigDecimal total = base;

        TaxBill bill = new TaxBill(
                billNo,
                "WATER_TAX",
                connection.getProperty(),
                connection,
                citizen,
                connection.getPanchayat(),
                financialYear,
                LocalDate.now(),
                dueDate,
                base,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                total,
                BigDecimal.ZERO,
                "PENDING",
                "Annual Gram Panchayat Water Supply Charge"
        );

        return taxBillRepository.save(bill);
    }
}
