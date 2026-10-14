package com.gramseva.repository;

import com.gramseva.entity.Complaint;
import com.gramseva.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    List<Complaint> findByCitizen(Citizen citizen);
    List<Complaint> findByCitizenId(Long citizenId);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByAssignedStaffId(Long staffId);
    List<Complaint> findByCategory(String category);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED'")
    long countResolvedComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status != 'RESOLVED' AND c.status != 'REJECTED'")
    long countActiveComplaints();
}
