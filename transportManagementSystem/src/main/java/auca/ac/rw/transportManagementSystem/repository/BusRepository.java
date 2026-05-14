package auca.ac.rw.transportManagementSystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import auca.ac.rw.transportManagementSystem.model.Bus;
import auca.ac.rw.transportManagementSystem.model.EStatus;

@Repository
public interface BusRepository extends JpaRepository<Bus, Integer> {
    
    // Custom query to fetch all buses with their drivers eagerly
    @Query("SELECT b FROM Bus b LEFT JOIN FETCH b.driver")
    List<Bus> findAllWithDriver();
    
    Optional<Bus> findByPlateNumber(String plateNumber);
    
    boolean existsByPlateNumber(String plateNumber);
    
    List<Bus> findByStatus(EStatus status);
    
    Page<Bus> findByStatus(EStatus status, Pageable pageable);
    
    List<Bus> findByRouteRouteId(int routeId);
    
    Optional<Bus> findByDriverDriverId(int driverId);
    
    List<Bus> findByCapacityGreaterThanEqual(int capacity);
    
    Page<Bus> findByPlateNumberContainingIgnoreCase(String plateNumber, Pageable pageable);
}