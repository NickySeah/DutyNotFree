package com.example.CSD.tariff;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {
    // List<Tariff> findByid(long id);

    // List<Tariff> findByHsCode_Code(String code);
    // List<Tariff> findByOriginCountryCode(String countryCode);
    // List<Tariff> findByDestCountryCode(String countryCode);

    // List<Tariff> findByOriginCountry_CodeAndDestCountry_Code(String originCode, String destCode);
    // List<Tariff> findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_Code(String originCode, String destCode, String hsCode);

    Optional<Tariff> findByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(String originCode, String destCode, String hsCode, String tariffType);
    boolean existsByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(String originCode, String destCode, String hsCode, String tariffType);
    void deleteByOriginCountry_CodeAndDestCountry_CodeAndHsCode_CodeAndTariffType(String originCode, String destCode, String hsCode, String tariffType);

    // List<Tariff> findByOriginCountryCodeOrderByEffectiveDateDesc(String countryCode);
    // List<Tariff> findByDestCountryCodeOrderByEffectiveDateDesc(String countryCode);

    @Query("""
    SELECT t FROM Tariff t 
        WHERE (:origin IS NULL OR :origin = '' OR LOWER(t.originCountry.code) = LOWER(:origin)) 
        AND (:dest IS NULL OR :dest = '' OR LOWER(t.destCountry.code) = LOWER(:dest)) 
        AND (:hsCode IS NULL OR :hsCode = '' OR LOWER(t.hsCode.code) = LOWER(:hsCode)) 
        AND (:type IS NULL OR :type = '' OR LOWER(t.tariffType) = LOWER(:type))
    """)
    List<Tariff> findByFilters(@Param("origin") String origin, @Param("dest") String dest, @Param("hsCode") String hsCode, @Param("type") String type);
}