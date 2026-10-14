package com.gramseva.controller;

import com.gramseva.dto.ApiResponse;
import com.gramseva.entity.Complaint;
import com.gramseva.entity.User;
import com.gramseva.entity.WaterConnection;
import com.gramseva.entity.WaterSupplySchedule;
import com.gramseva.repository.ComplaintRepository;
import com.gramseva.repository.UserRepository;
import com.gramseva.security.UserPrincipal;
import com.gramseva.service.ComplaintService;
import com.gramseva.service.WaterSupplyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
public class WaterSupplyController {

    private final WaterSupplyService waterSupplyService;
    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public WaterSupplyController(WaterSupplyService waterSupplyService,
                                 ComplaintService complaintService,
                                 ComplaintRepository complaintRepository,
                                 UserRepository userRepository) {
        this.waterSupplyService = waterSupplyService;
        this.complaintService = complaintService;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<WaterSupplySchedule>>> getSchedules() {
        return ResponseEntity.ok(ApiResponse.ok(waterSupplyService.getAllSchedules()));
    }

    @PutMapping("/schedules/{id}/status")
    public ResponseEntity<ApiResponse<WaterSupplySchedule>> updateScheduleStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                                                 @PathVariable Long id,
                                                                                 @RequestBody Map<String, String> payload) {
        User staff = userRepository.findById(principal.getId()).orElse(null);
        String status = payload.get("status");
        String noticeMessage = payload.get("noticeMessage");

        WaterSupplySchedule updated = waterSupplyService.updateStatus(id, status, noticeMessage, staff);
        return ResponseEntity.ok(ApiResponse.ok("Supply schedule updated", updated));
    }

    @GetMapping("/connections")
    public ResponseEntity<ApiResponse<List<WaterConnection>>> getConnections() {
        return ResponseEntity.ok(ApiResponse.ok(waterSupplyService.getAllConnections()));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<Complaint>>> getWaterComplaints() {
        return ResponseEntity.ok(ApiResponse.ok(complaintRepository.findByCategory("WATER_SUPPLY")));
    }

    @PutMapping("/complaints/{id}/resolve")
    public ResponseEntity<ApiResponse<Complaint>> resolveWaterComplaint(@PathVariable Long id,
                                                                        @RequestBody Map<String, String> payload) {
        String notes = payload.get("notes");
        Complaint c = complaintService.updateStatus(id, "RESOLVED", notes);
        return ResponseEntity.ok(ApiResponse.ok("Complaint marked as resolved", c));
    }
}
