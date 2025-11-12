package com.example.CSD.bloc;

import java.util.*;

public interface BlocService {
    /**
     * Retrieves all blocs (group of countries) in the system
     * 
     * @return a list of all blocs currently stored in the system
     *         Returns an empty list if no blocs are found
     */
    public List<Bloc> listBlocs();

    /**
     * Retrieves blocs based on given condition(s)
     * 
     * @param keyword word that may appear in the bloc's name
     * @param name exact name of the bloc
     * @param code the unique code of the bloc
     * @param countryCodes set of country codes that must be members of the bloc
     * @return a list of blocs matching the specified criteria
     *         If no parameters are provided, returns all blocs
     */
    public List<Bloc> getBloc(String keyword, String name, String code, Set<String> countryCodes);

    /**
     * Adds a new bloc to the system
     * 
     * @param request data carrier with the details of the bloc to be created
     * @return the newly created bloc
     */
    public Bloc addBloc(BlocCreateRequest request);

    /**
     * Updates an existing bloc identified by its code
     * 
     * @param code the unique code of the bloc
     * @param request data carrier with the details of the bloc to be updated
     * @return the updated bloc
     */
    public Bloc updateBloc(String code, BlocUpdateRequest request);

    /**
     * Deletes an existing bloc identified by its code
     * @param code the unique code of the bloc
     */
    public void deleteBloc(String code);
}