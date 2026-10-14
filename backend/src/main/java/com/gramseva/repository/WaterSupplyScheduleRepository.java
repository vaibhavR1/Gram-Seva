package com.gramseva.repository;

import com.gramseva.entity.WaterSupplySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterSupplyScheduleRepository extends JpaRepository<WaterSupplySchedule, Long> {
    List<WaterSupplySchedule> findByWardNumber(String wardNumber);
    Optional<WaterSupplySchedule> findFirstByWardNumberOrderByEffectiveDateDesc(String wardNumber);
    List<WaterSupplySchedule> findAllByOrderByWardNumberAsc();
}
