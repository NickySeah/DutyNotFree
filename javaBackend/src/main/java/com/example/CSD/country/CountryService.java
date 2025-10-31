package com.example.CSD.country;

import java.util.*;

public interface CountryService {
    /**
     * Retrieves all countries in the system
     * 
     * @return a list of all countries currently stored in the system
     *         Returns an empty list if no countries are found
     */
    public List<Country> listCountries();

    /**
     * Retrieves countries based on given condition(s)
     * 
     * @param iso the ISO code of the country
     * @param name exact name of the country
     * @param alpha3 the Alpha 3 code of the country
     * @return a list of countries matching the specified criteria
     *         If no parameters are provided, returns all countries
     */
    public List<Country> getCountry(String iso, String name, String alpha3);

    /**
     * Adds a new country to the system
     * 
     * @param newCountry the details of the country to be added
     * @return the newly created country
     */
    public Country addCountry(Country newCountry);

    /**
     * Updates an existing country identified by its ISO code
     * 
     * @param code the unique ISO code of the country
     * @param newCountry the details of the country to be updated
     * @return the newly created country
     */
    public Country updateCountry(String code, Country updatedCountry);

    /**
     * Deletes an existing country identified by its ISO code
     * @param code the unique ISO code of the country
     */
    public void deleteCountry(String code);
}