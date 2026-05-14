package auca.ac.rw.transportManagementSystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import auca.ac.rw.transportManagementSystem.model.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    
    Optional<Route> findByRouteName(String routeName);
    
    boolean existsByRouteName(String routeName);
    
    List<Route> findByStartPoint(String startPoint);
    
    List<Route> findByEndPoint(String endPoint);
    
    List<Route> findByRouteNameContainingIgnoreCase(String name);
    
    Page<Route> findByRouteNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<Route> findByStartPointContainingIgnoreCase(String startPoint, Pageable pageable);
    
    Page<Route> findByEndPointContainingIgnoreCase(String endPoint, Pageable pageable);
}