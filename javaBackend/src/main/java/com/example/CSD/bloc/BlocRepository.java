package com.example.CSD.bloc;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository 
public interface BlocRepository extends JpaRepository<Bloc, Long> {
    // Additional query methods can be defined here if needed
    boolean existsByCode(String code); // Custom query method
    boolean existsByName(String name);

    Optional<Bloc> findByCode(String code);
    void deleteByCode(String code);

    @Query("""
    SELECT b FROM Bloc b 
        WHERE (:name IS NULL OR :name = '' OR LOWER(b.name) = LOWER(:name)) 
        AND (:code IS NULL OR :code = '' OR LOWER(b.code) = LOWER(:code)) 
    """)
    List<Bloc> findByFilters(@Param("name") String name, @Param("code") String code);
}