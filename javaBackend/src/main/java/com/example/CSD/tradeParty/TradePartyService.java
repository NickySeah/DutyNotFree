package com.example.CSD.tradeParty;

import java.util.*;
// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class TradePartyService {// TODO: nothing for now
    private TradePartyRepository parties;

    public TradePartyService(TradePartyRepository parties) {
        this.parties = parties;
    }

    // public List<TradeParty> listCountries() {
    //     return countries.findAllByOrderByNameAsc();
    // }

    // public List<TradeParty> getTradeParty(String iso, String name, String alpha3) {
    //     if (iso == null && name == null && alpha3 == null) {
    //         return listCountries();
    //     }

    //     return countries.findByFilters(iso, name, alpha3);
    // }

    // public TradeParty addTradeParty(TradeParty newTradeParty) {
    //     // Check if TradeParty already exists
    //     if (countries.existsByCode(newTradeParty.getCode())) {
    //         throw new RuntimeException("TradeParty with code " + newTradeParty.getCode() + " already exists");
    //     }

    //     String iso = newTradeParty.getCode();
    //     String name = newTradeParty.getName();
    //     String alpha3 = newTradeParty.getAlpha3();

    //     if (iso == null || iso.trim().length() != 3) {
    //         throw new RuntimeException("Invalid ISO code");
    //     }
    //     if (name == null || name.isBlank()) {
    //         throw new RuntimeException("TradeParty name cannot be empty");
    //     }
    //     if (alpha3 == null || alpha3.trim().length() != 3) {
    //         throw new RuntimeException("Invalid Alpha 3 code");
    //     }

    //     return countries.save(newTradeParty);
    // }

    // public TradeParty updateTradeParty(String code, TradeParty updatedTradeParty) {
    //     TradeParty TradeParty = countries.findByCode(code)
    //             .orElseThrow(() -> new RuntimeException("TradeParty not found with iso code " + code));

    //     String name = updatedTradeParty.getName();
    //     String alpha3 = updatedTradeParty.getAlpha3();

    //     if (name != null) {
    //         if (!name.isBlank()) {
    //             TradeParty.setName(name);
    //         } else {
    //             throw new RuntimeException("TradeParty name cannot be empty");
    //         }
    //     }
    //     if (alpha3 != null) {
    //         if (alpha3.length() == 3) {
    //             TradeParty.setAlpha3(alpha3);
    //         } else {
    //             throw new RuntimeException("Alpha 3 code must be exactly 3 characters long");
    //         }
    //     }
    //     return countries.save(TradeParty);
    // }

    // @Transactional
    // public void deleteTradeParty(String code) {
    //     // Check if TradeParty exists before attempting to delete
    //     if (!countries.existsByCode(code)) {
    //         throw new RuntimeException("TradeParty not found with code " + code);
    //     }
    //     countries.deleteByCode(code);
    // }
}