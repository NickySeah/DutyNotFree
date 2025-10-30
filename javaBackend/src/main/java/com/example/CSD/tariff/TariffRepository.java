package com.example.CSD.tariff;

import java.time.LocalDate;
import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long>, JpaSpecificationExecutor<Tariff> {
    List<Tariff> findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(String originCode, String destCode, String hsCode, String tariffType);
    Optional<Tariff> findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(String originCode, String destCode, String hsCode, String tariffType, LocalDate effectiveDate);
    boolean existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(String originCode, String destCode, String hsCode, String tariffType);
    void deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffTypeAndEffectiveDate(String originCode, String destCode, String hsCode, String tariffType, LocalDate effectiveDate);

    // Find tariffs by optional filters, no date consideration
    @Query("""
    SELECT t FROM Tariff t 
        WHERE (:origin IS NULL OR :origin = '' OR LOWER(t.originCountry.code) = LOWER(:origin)) 
        AND (:dest IS NULL OR :dest = '' OR LOWER(t.destCountry.code) = LOWER(:dest)) 
        AND (:hsCode IS NULL OR :hsCode = '' OR LOWER(t.hsCode.code) = LOWER(:hsCode)) 
        AND (:type IS NULL OR :type = '' OR LOWER(t.tariffType) = LOWER(:type))
        ORDER BY
            t.hsCode.code ASC,
            t.originCountry.code ASC,
            t.destCountry.code ASC,
            t.tariffType ASC,
            t.effectiveDate ASC
    """)
    List<Tariff> findByFilters(@Param("origin") String origin, @Param("dest") String dest, @Param("hsCode") String hsCode, @Param("type") String type);

    // Find tariffs active during a specific date
    @Query("""
        SELECT t FROM Tariff t 
        WHERE (t.effectiveDate <= :date AND (t.expirationDate IS NULL OR t.expirationDate >= :date))
        ORDER BY
            t.hsCode.code ASC,
            t.originCountry.code ASC,
            t.destCountry.code ASC,
            t.tariffType ASC,
            t.effectiveDate ASC
    """)
    List<Tariff> findActiveTariffs(@Param("date") LocalDate date);

    @Query("""
        SELECT t FROM Tariff t 
        WHERE (:origin IS NULL OR :origin = '' OR LOWER(t.originCountry.code) = LOWER(:origin)) 
        AND (:dest IS NULL OR :dest = '' OR LOWER(t.destCountry.code) = LOWER(:dest)) 
        AND (:hsCode IS NULL OR :hsCode = '' OR LOWER(t.hsCode.code) = LOWER(:hsCode)) 
        AND (:type IS NULL OR :type = '' OR LOWER(t.tariffType) = LOWER(:type))
        AND (t.effectiveDate <= :date AND (t.expirationDate IS NULL OR t.expirationDate >= :date))
        ORDER BY t.effectiveDate ASC
    """)
    List<Tariff> findActiveTariffsByFilters(@Param("origin") String origin, @Param("dest") String dest, @Param("hsCode") String hsCode, @Param("type") String type, @Param("date") LocalDate date);
}