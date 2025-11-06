package com.example.CSD.bloc;

import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
 
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
@Schema(description = "Request payload for updating an existing bloc")
public class BlocUpdateRequest {  // Not an entity, just a data carrier
    @Schema(description = "ISO codes of countries that are added as members", example = "[096, 116]")
    private Set<String> addMemberCodes;

    @Schema(description = "ISO codes of countries that are removed as members", example = "[096, 116]")
    private Set<String> removeMemberCodes;
}