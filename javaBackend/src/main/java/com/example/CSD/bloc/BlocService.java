package com.example.CSD.bloc;

import java.util.*;
// import javax.swing.text.html.Option;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.CSD.country.*;

@Service
public class BlocService {
    private BlocRepository blocs;
    private CountryRepository countries;

    public BlocService(BlocRepository blocs, CountryRepository countries) {
        this.blocs = blocs;
        this.countries = countries;
    }

    public List<Bloc> listBlocs() {
        return blocs.findAll();         // TODO: countries are not sort alphabetically; not even sorted wth
    }

    public List<Bloc> getBloc(String name, String code) {
        if (name == null && code == null) {
            return listBlocs();
        }

        return blocs.findByFilters(name, code);
    }

    public Bloc addBloc(BlocCreateRequest request) {
        // Check if country already exists
        if (blocs.existsByCode(request.getCode())) {
            throw new RuntimeException("Bloc (" + request.getCode() + ") already exists");
        }

        // Validate compulsory keys
        String code = request.getCode();
        String name = request.getName();

        if (code == null || code.isBlank()) {
            throw new RuntimeException("Invalid acronym/code");
        }
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Bloc name cannot be empty");
        }

        // Check if bloc with same code or bloc with same name exists
        if (blocs.existsByCode(code)) {    
            throw new RuntimeException("Bloc with code " + code + " already exists");
        }
        else if (blocs.existsByName(name)) {     
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
                Country c = countries.findByCode(ccode)
                .orElseThrow(() -> new RuntimeException("Country not found with iso code " + ccode));

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
        Bloc country = blocs.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Country not found with iso code " + code));

        Set<Country> existingMembers = country.getMemberCountries();
        Set<String> addMemberCodes = request.getAddMemberCodes();
        Set<String> removeMemberCodes = request.getRemoveMemberCodes();
        if (addMemberCodes != null) {
            for (String addCode : addMemberCodes) {
                Country c = countries.findByCode(addCode)
                .orElseThrow(() -> new RuntimeException("Country not found with iso code " + addCode));

                existingMembers.add(c);         // will not have duplicates
            }
        }
        if (removeMemberCodes != null) {
            for (String removeCode : removeMemberCodes) {
                Country c = countries.findByCode(removeCode)
                .orElseThrow(() -> new RuntimeException("Country not found with iso code " + removeCode));

                existingMembers.remove(c);      // TODO: if country not a member, just ignore
            }

            if (existingMembers.size() < 2) {   // after removing members, must still have min 2 members
                throw new RuntimeException("Bloc must have at least two member countries");
            }
        }

        return blocs.save(country);
    }

    @Transactional
    public void deleteBloc(String code) {
        // Check if country exists before attempting to delete
        if (!blocs.existsByCode(code)) {
            throw new RuntimeException("Bloc not found with code " + code);
        }
        blocs.deleteByCode(code);
    }
}