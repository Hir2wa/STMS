package auca.ac.rw.transportManagementSystem.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import auca.ac.rw.transportManagementSystem.model.Elocation;
import auca.ac.rw.transportManagementSystem.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    Optional<Location> findByCode(String code);

    boolean existsByCode(String code);

    Page<Location> findByType(Elocation type, Pageable pageable);

    List<Location> findByType(Elocation type);

    Page<Location> findByParent(Location parent, Pageable pageable);

    List<Location> findByParent(Location parent);

    Page<Location> findByParentIsNull(Pageable pageable);

    List<Location> findByParentIsNull();

    @Query("SELECT l FROM Location l WHERE l.parent.code = :parentCode")
    Page<Location> findByParentCode(@Param("parentCode") String parentCode, Pageable pageable);

    @Query("SELECT l FROM Location l WHERE l.parent.code = :parentCode")
    List<Location> findByParentCode(@Param("parentCode") String parentCode);

    @Query("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Location> searchByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Location> searchByName(@Param("name") String name);

    @Query("SELECT COUNT(l) FROM Location l WHERE l.parent.locationId = :parentId")
    long countChildrenByParentId(@Param("parentId") UUID parentId);

    // Find location by name and type
    Optional<Location> findByNameAndType(String name, Elocation type);

    // Check if location exists by name and type
    boolean existsByNameAndType(String name, Elocation type);

    // Get distinct provinces that have users - simplified query
    @Query("SELECT DISTINCT l FROM Location l WHERE l.type = 'PROVINCE' " +
           "AND (EXISTS (SELECT 1 FROM User u WHERE u.location = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent.parent.parent = l))")
    List<Location> findProvincesWithUsers();

    // Get distinct provinces that have users with pagination
    @Query("SELECT DISTINCT l FROM Location l WHERE l.type = 'PROVINCE' " +
           "AND (EXISTS (SELECT 1 FROM User u WHERE u.location = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent.parent = l) OR " +
           "EXISTS (SELECT 1 FROM User u WHERE u.location.parent.parent.parent.parent = l))")
    Page<Location> findProvincesWithUsers(Pageable pageable);

}