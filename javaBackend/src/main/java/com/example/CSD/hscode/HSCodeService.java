package com.example.CSD.hscode;

import java.util.*;

public interface HSCodeService {
    /**
     * Retrieves all HS Codes in the system
     * 
     * @return a list of all HS Codes currently stored in the system
     *         Returns an empty list if no HS Codes are found
     */
    public List<HSCode> listHSCode();

    /**
     * Retrieves HS Codes based on given condition(s)
     * 
     * @param code the HS code
     * @param keyword a keyword to search within HS code descriptions
     * @return a list of HS Codes matching the specified criteria
     *         If no parameters are provided, returns all HS Codes
     */
    public List<HSCode> getHSCode(String code, String keyword);

    /**
     * Adds a new HS Code to the system
     * 
     * @param newHSCode the details of the HS Code to be added
     * @return the newly created HS Code
     */
    public HSCode addHSCode(HSCode newHSCode);

    /**
     * Updates an existing HS Code identified by its code
     * 
     * @param code the unique HS Code
     * @param newHSCode the details of the HS Code to be updated
     * @return the newly created HS Code
     */
    public HSCode updateHSCode(String code, HSCode updatedHSCode);

    /**
     * Deletes an existing HS Code identified by its code
     * @param code the unique HS Code
     */
    public void deleteHSCode(String code);
}