package com.example.CSD.tariff;

import java.util.*;

public interface TariffService {
    /**
     * Retrieves all tariffs in the system
     * 
     * @return a list of all tariffs currently stored in the system
     *         Returns an empty list if no tariffs are found
     */
    public List<Tariff> listTariffs();

    /**
     * Retrieves tariffs based on given condition(s)
     * 
     * @param originCode the origin country code
     * @param destCode the destination country code
     * @param hsCode the HS code associated with the tariff
     * @param tariffType the type of tariff
     * @return a list of tariffs matching the specified criteria
     *         If no parameters are provided, returns all tariffs
     */
    public List<Tariff> getTariff(String originCode, String destCode, String hsCode, String tariffType);
    
    /**
     * Retrieves a tariff by its unique ID
     * 
     * @param id the unique ID of the tariff
     * @return the tariff with the specified ID
     */
    public Tariff getTariffByID(Long id);

    /**
     * Retrieves active tariffs based on given condition(s)
     * 
     * @param originCode the origin country code
     * @param destCode the destination country code
     * @param hsCode the HS code associated with the tariff
     * @param tariffType the type of tariff
     * @param date the date to check for active tariffs
     * @return a list of active tariffs matching the specified criteria
     */
    public List<Tariff> getActiveTariffs(String originCode, String destCode, String hsCode, String tariffType, String date);

    /**
     * Creates a new tariff in the system
     * 
     * @param request data carrier with the details of the tariff to be created
     * @return the newly created tariff
     */
    public Tariff createTariff(TariffCreateRequest request);

    /**
     * Updates an existing tariff identified by its origin code, destination code, HS code, tariff type, and effective date
     * 
     * @param originCode the origin country code
     * @param destCode the destination country code
     * @param hsCodeValue the HS code associated with the tariff
     * @param tariffType the type of tariff
     * @param effectiveDateStr the effective date of the tariff
     * @param request data carrier with the details of the tariff to be updated
     * @return the updated tariff
     */
    public Tariff updateTariff(String originCode, String destCode, String hsCodeValue, String tariffType, String effectiveDateStr, TariffUpdateRequest request);
    
    /**
     * Updates an existing tariff identified by its ID
     * 
     * @param id the unique ID of the tariff
     * @param request data carrier with the details of the tariff to be updated
     * @return the updated tariff
     */
    public Tariff updateTariffById(Long id, TariffUpdateRequest request);

    /**
     * Deletes an existing tariff identified by its origin code, destination code, HS code, tariff type, and effective date
     * 
     * @param originCode the origin country code
     * @param destCode the destination country code
     * @param hsCodeValue the HS code associated with the tariff
     * @param tariffType the type of tariff
     * @param effectiveDateStr the effective date of the tariff
     */
    public void deleteTariff(String originCode, String destCode, String hsCodeValue, String tariffType, String effectiveDateStr);

    /**
     * Deletes an existing tariff identified by its ID
     * @param id the unique ID of the tariff
     */
    public void  deleteTariffById(Long id);
}