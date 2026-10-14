package com.gramseva.service;

import com.gramseva.dto.AuthResponse;
import com.gramseva.dto.LoginRequest;
import com.gramseva.dto.RegisterRequest;
import com.gramseva.entity.Citizen;
import com.gramseva.entity.Panchayat;
import com.gramseva.entity.Role;
import com.gramseva.entity.User;
import com.gramseva.repository.CitizenRepository;
import com.gramseva.repository.PanchayatRepository;
import com.gramseva.repository.UserRepository;
import com.gramseva.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final PanchayatRepository panchayatRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       CitizenRepository citizenRepository,
                       PanchayatRepository panchayatRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.citizenRepository = citizenRepository;
        this.panchayatRepository = panchayatRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long citizenId = null;
        if (user.getRole() == Role.CITIZEN) {
            citizenId = citizenRepository.findByUserId(user.getId())
                    .map(Citizen::getId)
                    .orElse(null);
        }

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                citizenId
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email '" + request.getEmail() + "' is already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CITIZEN;
        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                role
        );
        user = userRepository.save(user);

        Long citizenId = null;
        if (role == Role.CITIZEN) {
            Panchayat panchayat = panchayatRepository.findAll().stream().findFirst().orElse(null);
            Citizen citizen = new Citizen();
            citizen.setUser(user);
            citizen.setPanchayat(panchayat);
            citizen.setWardNumber(request.getWardNumber() != null ? request.getWardNumber() : "Ward-1");
            citizen.setHouseNumber(request.getHouseNumber());
            citizen.setAddress(request.getAddress());
            citizen.setRationCardNumber(request.getRationCardNumber());
            if (request.getAadharNumber() != null && request.getAadharNumber().length() >= 4) {
                citizen.setAadharMasked("XXXX-XXXX-" + request.getAadharNumber().substring(request.getAadharNumber().length() - 4));
            }
            citizen = citizenRepository.save(citizen);
            citizenId = citizen.getId();
        }

        String jwt = tokenProvider.generateTokenFromUsername(user.getUsername(), user.getId());

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                citizenId
        );
    }
}
