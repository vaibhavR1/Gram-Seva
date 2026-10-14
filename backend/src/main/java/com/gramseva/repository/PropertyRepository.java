package com.gramseva.repository;

import com.gramseva.entity.Property;
import com.gramseva.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    Optional<Property> findByPropertyNumber(String propertyNumber);
    List<Property> findByOwner(Citizen owner);
    List<Property> findByOwnerId(Long citizenId);
    List<Property> findByWardNumber(String wardNumber);
    boolean existsByPropertyNumber(String propertyNumber);
}
