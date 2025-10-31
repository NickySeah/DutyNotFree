package com.example.CSD.fta;

import java.util.*;

public interface FTAService {
    /**
     * Retrieves all free trade agreements in the system
     * 
     * @return a list of all free trade agreements currently stored in the system
     *         Returns an empty list if no free trade agreements are found
     */
    public List<FTA> listFTAs();

    /**
     * Retrieves a free trade agreement by its unique ID
     * 
     * @param id the unique ID of the free trade agreement
     * @return the free trade agreement with the specified ID
     */
    public FTA getFTAByID(Long id);

    /**
     * Retrieves free trade agreements based on given condition(s)
     * 
     * @param type the type of free trade agreement
     * @param partyA the first party involved in the agreement
     * @param partyB the second party involved in the agreement
     * @return a list of free trade agreements matching the specified criteria
     *         If no parameters are provided, returns all free trade agreements
     */
    public List<FTA> getFTA(String type, String partyA, String partyB);

    /**
     * Retrieves active free trade agreements based on given condition(s)
     * 
     * @param type the type of free trade agreement
     * @param partyA the first party involved in the agreement
     * @param partyB the second party involved in the agreement
     * @param date the date to check for active agreements
     * @return a list of active free trade agreements matching the specified criteria
     */
    public List<FTA> getActiveFTA(String type, String partyA, String partyB, String date);

    /**
     * Adds a new free trade agreement to the system
     * 
     * @param request data carrier with the details of the FTA to be created
     * @return the newly created FTA
     */    
    public FTA createFTA(FTACreateRequest request);

    /**
     * Updates an existing free trade agreement identified by its ID
     * 
     * @param id the unique ID of the FTA
     * @param request data carrier with the details of the FTA to be updated
     * @return the updated FTA
     */
    public FTA updateFTA(Long id, FTAUpdateRequest request);

    /**
     * Deletes an existing free trade agreement identified by its ID
     * @param id the unique ID of the bloc
     */
    public void deleteFTA(Long id);
}