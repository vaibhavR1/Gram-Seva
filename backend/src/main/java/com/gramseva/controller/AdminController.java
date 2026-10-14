package com.gramseva.controller;

import com.gramseva.dto.ApiResponse;
import com.gramseva.dto.DashboardStatsDto;
import com.gramseva.entity.AuditLog;
import com.gramseva.entity.Panchayat;
import com.gramseva.entity.Role;
import com.gramseva.entity.User;
import com.gramseva.repository.AuditLogRepository;
import com.gramseva.repository.PanchayatRepository;
import com.gramseva.repository.UserRepository;
import com.gramseva.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DashboardService dashboardService;
    private final PanchayatRepository panchayatRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(DashboardService dashboardService,
                           PanchayatRepository panchayatRepository,
                           UserRepository userRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.dashboardService = dashboardService;
        this.panchayatRepository = panchayatRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardStats()));
    }

    @GetMapping("/panchayats")
    public ResponseEntity<ApiResponse<List<Panchayat>>> getPanchayats() {
        return ResponseEntity.ok(ApiResponse.ok(panchayatRepository.findAll()));
    }

    @PostMapping("/panchayats")
    public ResponseEntity<ApiResponse<Panchayat>> createPanchayat(@RequestBody Panchayat panchayat) {
        Panchayat saved = panchayatRepository.save(panchayat);
        return ResponseEntity.ok(ApiResponse.ok("Panchayat registered successfully", saved));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userRepository.findAll()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username already taken"));
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", saved));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", saved));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(auditLogRepository.findTop50ByOrderByCreatedAtDesc()));
    }
}
