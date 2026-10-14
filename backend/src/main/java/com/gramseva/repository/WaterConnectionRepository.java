package com.gramseva.repository;

import com.gramseva.entity.WaterConnection;
import com.gramseva.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterConnectionRepository extends JpaRepository<WaterConnection, Long> {
    Optional<WaterConnection> findByConnectionNumber(String connectionNumber);
    List<WaterConnection> findByCitizen(Citizen citizen);
    List<WaterConnection> findByCitizenId(Long citizenId);
    List<WaterConnection> findByPropertyId(Long propertyId);
    boolean existsByConnectionNumber(String connectionNumber);
}
