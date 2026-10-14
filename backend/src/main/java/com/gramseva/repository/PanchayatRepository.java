package com.gramseva.repository;

import com.gramseva.entity.Panchayat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PanchayatRepository extends JpaRepository<Panchayat, Long> {
}
