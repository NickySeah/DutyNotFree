package com.example.CSD.tradeParty;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository 
public interface TradePartyRepository extends JpaRepository<TradeParty, Long> {
    // Additional query methods can be defined here if needed
    Optional<TradeParty> findByCountryCode(String code);
    Optional<TradeParty> findByBlocCode(String code);
}