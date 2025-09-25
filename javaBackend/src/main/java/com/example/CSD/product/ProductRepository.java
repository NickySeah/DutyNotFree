package com.example.CSD.product;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Additional query methods can be defined here if needed
    List<Product> findById(long id);
    // List<Product> findByHsCode_Code(String code);
    // List<Product> findByName(String name);
    Optional<Product> findByNameAndUserIdAndHsCode_Code(String name, int userId, String code);
    boolean existsByNameAndUserIdAndHsCode_Code(String name, int userId, String code);
    void deleteByNameAndUserIdAndHsCode_Code(String name, int userId, String code);

    @Query("""
    SELECT p FROM Product p 
        WHERE (:userId IS NULL OR p.userId = :userId) 
        AND (:name IS NULL OR :name = '' OR LOWER(p.name) = LOWER(:name)) 
        AND (:hsCode IS NULL OR :hsCode = '' OR LOWER(p.hsCode.code) = LOWER(:hsCode)) 
    """)
    List<Product> findByFilters(@Param("userId") Integer userID, @Param("name") String name, @Param("hsCode") String hsCode);
}