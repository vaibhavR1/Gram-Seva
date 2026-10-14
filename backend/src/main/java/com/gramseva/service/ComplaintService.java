package com.gramseva.service;

import com.gramseva.dto.ComplaintRequest;
import com.gramseva.entity.Citizen;
import com.gramseva.entity.Complaint;
import com.gramseva.entity.User;
import com.gramseva.repository.CitizenRepository;
import com.gramseva.repository.ComplaintRepository;
import com.gramseva.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            CitizenRepository citizenRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.citizenRepository = citizenRepository;
        this.userRepository = userRepository;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getComplaintsByCitizenId(Long citizenId) {
        return complaintRepository.findByCitizenId(citizenId);
    }

    public List<Complaint> getComplaintsByStaffId(Long staffId) {
        return complaintRepository.findByAssignedStaffId(staffId);
    }

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
    }

    public Complaint getComplaintByNumber(String complaintNumber) {
        return complaintRepository.findByComplaintNumber(complaintNumber)
                .orElseThrow(() -> new RuntimeException("Complaint not found with tracking number: " + complaintNumber));
    }

    @Transactional
    public Complaint submitComplaint(ComplaintRequest request, User currentUser) {
        Citizen citizen = citizenRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Citizen profile not found for user: " + currentUser.getUsername()));

        String trackingNo = "CMP-" + LocalDateTime.now().getYear() + "-" + (1000 + complaintRepository.count() + 1);

        Complaint complaint = new Complaint(
                trackingNo,
                citizen,
                request.getCategory(),
                request.getTitle(),
                request.getDescription(),
                request.getWardNumber(),
                request.getPhotoUrl(),
                "SUBMITTED",
                request.getPriority() != null ? request.getPriority() : "MEDIUM",
                null,
                null
        );

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint assignStaff(Long complaintId, Long staffUserId) {
        Complaint complaint = getComplaintById(complaintId);
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new RuntimeException("Staff user not found with id: " + staffUserId));

        complaint.setAssignedStaff(staff);
        complaint.setStatus("ASSIGNED");
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint updateStatus(Long complaintId, String newStatus, String resolutionNotes) {
        Complaint complaint = getComplaintById(complaintId);
        complaint.setStatus(newStatus);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            complaint.setResolutionNotes(resolutionNotes);
        }
        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        return complaintRepository.save(complaint);
    }
}
