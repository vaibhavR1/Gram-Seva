package com.gramseva.repository;

import com.gramseva.entity.Citizen;
import com.gramseva.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {
    Optional<Citizen> findByUser(User user);
    Optional<Citizen> findByUserId(Long userId);
    List<Citizen> findByWardNumber(String wardNumber);
}
