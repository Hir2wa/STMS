package auca.ac.rw.transportManagementSystem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import auca.ac.rw.transportManagementSystem.model.Driver;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    
    Optional<Driver> findByLicenseNumber(String licenseNumber);

    Optional<Driver> findByEmail(String email);
    
    boolean existsByLicenseNumber(String licenseNumber);

    boolean existsByEmail(String email);
    
    List<Driver> findByExperienceYearsGreaterThanEqual(int years);
    
    List<Driver> findByNameContainingIgnoreCase(String name);
    
    Page<Driver> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<Driver> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    
    Page<Driver> findByLicenseNumberContainingIgnoreCase(String licenseNumber, Pageable pageable);
}