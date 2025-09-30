package com.example.CSD.country;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository 
public interface CountryRepository extends JpaRepository<Country, Long> {
    // Additional query methods can be defined here if needed
    boolean existsByCode(String code); // Custom query method
    Optional<Country> findByCode(String code);
    void deleteByCode(String code);
    List<Country> findAllByOrderByNameAsc();

    @Query("""
    SELECT c FROM Country c 
        WHERE (:code IS NULL OR :code = '' OR LOWER(c.code) = LOWER(:code)) 
        AND (:name IS NULL OR :name = '' OR LOWER(c.name) = LOWER(:name)) 
        AND (:alpha3 IS NULL OR :alpha3 = '' OR LOWER(c.alpha3) = LOWER(:alpha3)) 
    """)
    List<Country> findByFilters(@Param("code") String code, @Param("name") String name, @Param("alpha3") String alpha3);
}