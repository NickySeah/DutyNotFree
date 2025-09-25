package com.example.CSD.tariff;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class TariffRequest {
    private String hsCode;          
    private String originCountry;
    private String destCountry;
    private String tariffType;
    private Double standardRate;    
    private Double flatFee;
    private String startDate;       // YYYY-MM-DD format
    private String endDate;         // YYYY-MM-DD format
}
