package com.example.CSD.bloc;

import java.util.*;
import java.util.stream.Collectors;

// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.country.*;
import com.example.CSD.tradeParty.TradeParty;

@Service
public class BlocService {
    private BlocRepository blocs;
    private CountryRepository countries;

    public BlocService(BlocRepository blocs, CountryRepository countries) {
        this.blocs = blocs;
        this.countries = countries;
    }

    public List<Bloc> listBlocs() {
        return blocs.findAll();
    }

    public List<Bloc> getBloc(String keyword, String name, String code, Set<String> countryCodes) {
        if (keyword == null && name == null && code == null && countryCodes == null) {  // Nothing specified; Return all  
            return listBlocs();
        }

        List<Bloc> result = blocs.findByFilters(keyword, name, code);   // If code and/or exact/part name specified, find those; Else return all 
        if (countryCodes != null) {                                     // COuntries specified
            Iterator<Bloc> iterator = result.iterator();                    
            while (iterator.hasNext()) {                                    // Check all bloc to find bloc(s) that contain all specified countries
                Bloc b = iterator.next();
                Set<String> memberCodes = b.getMemberCountries()
                                        .stream()
                                        .map(Country::getCode)
                                        .collect(Collectors.toSet());
    
                if (!memberCodes.containsAll(countryCodes)) {
                    iterator.remove();
                }
            }
        }

        return result;
    }

    public Bloc addBloc(BlocCreateRequest request) {
        // Check if country already exists
        if (blocs.existsByCode(request.getCode())) {
            throw new RuntimeException("Bloc (" + request.getCode() + ") already exists");
        }

        // Validate compulsory fields
        String code = request.getCode();
        String name = request.getName();

        if (code == null || code.isBlank()) {
            throw new RuntimeException("Code or acronym of bloc cannot be empty");
        }
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Bloc name cannot be empty");
        }

        // Check if bloc with same code or bloc with same name exists
        // if (blocs.existsByCode(code)) {    
        //     throw new RuntimeException("Bloc with code " + code + " already exists");
        // } else   // Redundant because already checked at start of method
        if (blocs.existsByName(name)) {     
            throw new RuntimeException("Bloc with name " + name + " already exists");
        }

        // Validate member countries code
        Set<Country> memberCountries = new HashSet<>();
        Set<String> memberCountryCodes = request.getMemberCodes();
        if (memberCountryCodes == null || memberCountryCodes.size() < 2) {
            throw new RuntimeException("Bloc must have at least two member countries");
        }
        else {
            for (String ccode : memberCountryCodes) {
                Country c = countries.findByCode(ccode)                                                 // Checks if country with code exists 
                .orElseThrow(() -> new RuntimeException("No country found with iso code " + ccode));    // If one doesn't exist, don't add new bloc

                memberCountries.add(c);
            }
        }

        // Create and save Bloc
        Bloc newBloc = new Bloc();
        newBloc.setCode(code);
        newBloc.setName(name);
        newBloc.setMemberCountries(memberCountries);

        return blocs.save(newBloc);
    } 

    public Bloc updateBloc(String code, BlocUpdateRequest request) {
        Bloc bloc = blocs.findByCode(code)
            .orElseThrow(() -> new RuntimeException("No country found with iso code " + code));

        Set<Country> existingMembers = bloc.getMemberCountries();
        Set<String> addMemberCodes = request.getAddMemberCodes();               // TODO: do we allow both adding and deleting
        Set<String> removeMemberCodes = request.getRemoveMemberCodes();
        if (addMemberCodes != null) {
            for (String addCode : addMemberCodes) {
                Country c = countries.findByCode(addCode)                                                   // Checks if country with code exists      
                .orElseThrow(() -> new RuntimeException("No country found with iso code " + addCode));      // If one doesn't exist, don't update bloc

                existingMembers.add(c);                                                                     // No duplicates because HashSet is used
            }
        }
        if (removeMemberCodes != null) {
            for (String removeCode : removeMemberCodes) {
                Country c = countries.findByCode(removeCode)                                                // Checks if country with code exists
                .orElseThrow(() -> new RuntimeException("No country found with iso code " + removeCode));   // If one doesn't exist, don't update bloc
        
                existingMembers.remove(c);      // TODO: if country not a member, just ignore?
            }

            if (existingMembers.size() < 2) {                                                               // Check bloc still has min 2 members
                throw new RuntimeException("Bloc must have at least two member countries");
            }
        }

        return blocs.save(bloc);
    }

    @Transactional
    public void deleteBloc(String code) {
        // Check if country exists before attempting to delete
        Bloc bloc = blocs.findByCode(code)
        .orElseThrow(() -> new RuntimeException("No bloc found with code " + code));

        TradeParty blocTP = bloc.getTradeParty();
        if (!blocTP.getFtasAsPartyA().isEmpty() || !blocTP.getFtasAsPartyB().isEmpty()) {
            throw new RuntimeException("Cannot delete "+ bloc.getCode()+" (" + bloc.getName() + ") because it is part of one or more FTAs.");
        }

        blocs.deleteByCode(code);
    }
}