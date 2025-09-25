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
    List<HSCode> findByCategory(String category);
    void deleteByCode(String code);
    boolean existsByCode(String code);

    @Query("""
    SELECT h FROM HSCode h 
        WHERE (:code IS NULL OR :code = '' OR LOWER(h.code) = LOWER(:code)) 
        AND (:category IS NULL OR :category = '' OR LOWER(h.category) = LOWER(:category)) 
    """)
    List<HSCode> findByFilters(@Param("code") String code, @Param("category") String category);
}