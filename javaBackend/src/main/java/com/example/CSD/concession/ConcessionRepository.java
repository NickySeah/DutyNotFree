package com.example.CSD.concession;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.CSD.fta.FTA;
import com.example.CSD.hscode.HSCode;

@Repository 
public interface ConcessionRepository extends JpaRepository<Concession, Long> {
    // Additional query methods can be defined here if needed
    boolean existsByFtaAndHsCode(FTA fta, HSCode hsCode);

    @Query("""
    SELECT c FROM Concession c 
        WHERE (:ftaID IS NULL OR c.fta = :ftaID) 
        AND (:hscode IS NULL OR :hscode = '' OR LOWER(c.hsCode.code) = LOWER(:hscode))
    """)
    List<Concession> findByFilters(@Param("ftaID") Long ftaID, @Param("hscode") String hscode);
}