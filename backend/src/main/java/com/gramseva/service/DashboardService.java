package com.gramseva.service;

import com.gramseva.dto.DashboardStatsDto;
import com.gramseva.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {

    private final CitizenRepository citizenRepository;
    private final PropertyRepository propertyRepository;
    private final WaterConnectionRepository waterConnectionRepository;
    private final TaxBillRepository taxBillRepository;
    private final ComplaintRepository complaintRepository;
    private final AnnouncementRepository announcementRepository;

    public DashboardService(CitizenRepository citizenRepository,
                            PropertyRepository propertyRepository,
                            WaterConnectionRepository waterConnectionRepository,
                            TaxBillRepository taxBillRepository,
                            ComplaintRepository complaintRepository,
                            AnnouncementRepository announcementRepository) {
        this.citizenRepository = citizenRepository;
        this.propertyRepository = propertyRepository;
        this.waterConnectionRepository = waterConnectionRepository;
        this.taxBillRepository = taxBillRepository;
        this.complaintRepository = complaintRepository;
        this.announcementRepository = announcementRepository;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalCitizens(citizenRepository.count());
        stats.setTotalProperties(propertyRepository.count());
        stats.setTotalWaterConnections(waterConnectionRepository.count());

        stats.setTotalBills(taxBillRepository.countTotalBills());
        stats.setPaidBills(taxBillRepository.countPaidBills());
        stats.setPendingBills(taxBillRepository.countPendingBills());

        BigDecimal demand = taxBillRepository.sumTotalDemand();
        BigDecimal collected = taxBillRepository.sumTotalCollected();
        stats.setTotalDemand(demand != null ? demand : BigDecimal.ZERO);
        stats.setTotalCollected(collected != null ? collected : BigDecimal.ZERO);
        stats.setTotalOutstanding(stats.getTotalDemand().subtract(stats.getTotalCollected()));

        stats.setTotalComplaints(complaintRepository.count());
        stats.setResolvedComplaints(complaintRepository.countResolvedComplaints());
        stats.setActiveComplaints(complaintRepository.countActiveComplaints());

        stats.setActiveAnnouncements(announcementRepository.findActiveNotices(LocalDate.now()).size());

        return stats;
    }
}
