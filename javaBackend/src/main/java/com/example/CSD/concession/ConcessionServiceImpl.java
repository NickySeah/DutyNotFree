package com.example.CSD.concession;

import java.util.*;
import java.util.stream.Collectors;

// import com.example.CSD.fta.*;
// import com.example.CSD.hscode.*;

// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class ConcessionServiceImpl implements ConcessionService {
    private ConcessionRepository concessions;
    // private FTARepository agreements;
    // private HSCodeRepository hscodes;

    public ConcessionServiceImpl(ConcessionRepository concessions) { //, FTARepository agreements, HSCodeRepository hscodes) {
        this.concessions = concessions;
        // this.agreements = agreements;
        // this.hscodes = hscodes;
    }

    // public List<Concession> listConcessions() {
    //     return concessions.findAll();
    // }

    // public Concession getConcessionByID(Long id) {
    //     return concessions.findById(id).orElseThrow(() -> new RuntimeException("No special concession with id "+id+" exist."));
    // }

    // public List<Concession> getConcessions(Long ftaID, String hsCode) {
    //     if (ftaID == null && hsCode == null) {                              // Nothing specified; Return all  
    //         return listConcessions();
    //     }

    //     List<Concession> result = concessions.findByFilters(ftaID, hsCode); 
    //     return result;
    // }

    // public Concession addConcession(ConcessionCreateRequest request) {
    //     // Validate compulsory fields
    //     Long ftaId = request.getFtaId();
    //     String hsCodeStr = request.getHsCode();

    //     if (ftaId == null || ftaId <= 0) {
    //         throw new RuntimeException("FTA ID cannot be empty or negative");
    //     }
    //     if (hsCodeStr == null || hsCodeStr.isBlank()) {
    //         throw new RuntimeException("HS code cannot be empty");
    //     }

    //     FTA fta = agreements.findById(ftaId)
    //         .orElseThrow(() -> new RuntimeException("No FTA found with ID " + ftaId));
    //     HSCode hsCode = hscodes.findByCode(hsCodeStr)
    //         .orElseThrow(() -> new RuntimeException("No HSCode found with code " + hsCodeStr));
        
    //     // Check if concession already exists
    //     if (concessions.existsByFtaAndHsCode(fta, hsCode)) {
    //         throw new RuntimeException("Concession for FTA ID " + ftaId + " and HS Code " + hsCodeStr + " already exists");
    //     }
        
    //     // Validate final rate and staging duration
    //     Double finalRate = request.getFinalRate();
    //     // Integer stagingDuration = request.getStagingDuration();
        
    //     if (finalRate == null || finalRate < 0.0) {
    //         throw new RuntimeException("Final rate cannot be empty or negative");
    //     }
    //     // if (stagingDuration == null || stagingDuration < 0) {
    //     //     throw new RuntimeException("Staging duration cannot be empty or negative");
    //     // }
        
    //     // Create and save concession
    //     Concession newConcession = new Concession();
    //     newConcession.setFta(fta);
    //     newConcession.setHsCode(hsCode);
    //     newConcession.setFinalRate(finalRate);
    //     // newConcession.setStagingDuration(stagingDuration);

    //     return concessions.save(newConcession);
    // } 

    // public Concession updateConcession(Long id, ConcessionUpdateRequest request) {
    //     Concession concession = concessions.findById(id)
    //         .orElseThrow(() -> new RuntimeException("No concession found with id " + id));

    //     if (request.isRateProvided()) {
    //         Double finalRate = request.getFinalRate();
    //         if (finalRate < 0.0) {
    //             throw new RuntimeException("Final rate cannot be negative");
    //         }
    //         concession.setFinalRate(finalRate);
    //     }
    //     // if (request.isDurationProvided()) {
    //     //     Integer stagingDuration = request.getStagingDuration();
    //     //     if (stagingDuration < 0) {
    //     //         throw new RuntimeException("Staging duration cannot be negative");
    //     //     }
    //     //     concession.setStagingDuration(stagingDuration);
    //     // }

    //     return concessions.save(concession);
    // }

    // @Transactional
    // public void deleteConcession(Long id) {
    //     // Check if country exists before attempting to delete
    //     if (!concessions.existsById(id)) {
    //         throw new RuntimeException("No concession found with id " + id);
    //     }
    //     concessions.deleteById(id);
    // }
}