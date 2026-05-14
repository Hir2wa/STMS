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

import auca.ac.rw.transportManagementSystem.model.Student;
import auca.ac.rw.transportManagementSystem.model.StudentStatus;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    
    List<Student> findByClassName(String className);
    
    List<Student> findByStatus(StudentStatus status);
    
    Page<Student> findByStatus(StudentStatus status, Pageable pageable);
    
    List<Student> findByParentUserId(UUID parentId);
    
    List<Student> findByBusId(int busId);
    
    List<Student> findByPickUpPoint(String pickUpPoint);
    
    List<Student> findByDropOffPoint(String dropOffPoint);
    
    List<Student> findByNameContainingIgnoreCase(String name);
    
    Page<Student> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<Student> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    
    Page<Student> findByClassNameContainingIgnoreCase(String className, Pageable pageable);
    
    Optional<Student> findByEmail(String email);
    
    // Find all students with matching email (for handling duplicates)
    @Query("SELECT s FROM Student s WHERE LOWER(s.email) = LOWER(:email) ORDER BY s.id ASC")
    List<Student> findByEmailList(@Param("email") String email);
    
    // Find students by location code (direct match)
    List<Student> findByLocationCode(String locationCode);
    
    Page<Student> findByLocationCode(String locationCode, Pageable pageable);
    
    // Find students by location code in hierarchy (traverses up the location tree)
    @Query("SELECT s FROM Student s WHERE " +
           "s.location.code = :locationCode OR " +
           "s.location.parent.code = :locationCode OR " +
           "s.location.parent.parent.code = :locationCode OR " +
           "s.location.parent.parent.parent.code = :locationCode OR " +
           "s.location.parent.parent.parent.parent.code = :locationCode")
    List<Student> findByLocationCodeInHierarchy(@Param("locationCode") String locationCode);
    
    @Query("SELECT s FROM Student s WHERE " +
           "s.location.code = :locationCode OR " +
           "s.location.parent.code = :locationCode OR " +
           "s.location.parent.parent.code = :locationCode OR " +
           "s.location.parent.parent.parent.code = :locationCode OR " +
           "s.location.parent.parent.parent.parent.code = :locationCode")
    Page<Student> findByLocationCodeInHierarchy(@Param("locationCode") String locationCode, Pageable pageable);
}