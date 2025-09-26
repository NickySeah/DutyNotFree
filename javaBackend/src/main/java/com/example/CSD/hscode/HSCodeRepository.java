package com.example.CSD.hscode;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository 
public interface HSCodeRepository extends JpaRepository<HSCode, Long> {
    // Additional query methods can be defined here if needed
    // List<HSCode> findByid(long id);
    Optional<HSCode> findByCode(String code);
    void deleteByCode(String code);
    boolean existsByCode(String code);

    @Query("""
    SELECT h FROM HSCode h 
        WHERE (:code IS NULL OR :code = '' OR LOWER(h.code) = LOWER(:code))
        AND (:description IS NULL OR :description = '' OR LOWER(h.description) LIKE LOWER(CONCAT('%', :description, '%')))
    """)
    List<HSCode> findByFilters(@Param("code") String code, @Param("description") String keyword);
}