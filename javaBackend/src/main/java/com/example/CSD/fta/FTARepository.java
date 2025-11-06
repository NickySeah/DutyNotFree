package com.example.CSD.fta;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.CSD.fta.FTA.FTAType;
import com.example.CSD.tradeParty.TradeParty;

@Repository 
public interface FTARepository extends JpaRepository<FTA, Long> {
    // Additional query methods can be defined here if needed
    List<FTA> findAllByType(FTAType type);

    @Query("""
    SELECT f FROM FTA f
    WHERE ((f.partyA = :partyA AND f.partyB = :partyB)
        OR (f.partyA = :partyB AND f.partyB = :partyA))
    """)
    List<FTA> findByParties(@Param("partyA") TradeParty partyA, @Param("partyB") TradeParty partyB);
}