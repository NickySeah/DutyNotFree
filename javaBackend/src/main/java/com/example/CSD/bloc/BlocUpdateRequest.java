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
@Schema(description = "Request payload for creating a new bloc")
public class BlocUpdateRequest {  // Not an entity, just a data carrier   //TODO: if want to change JSON field names, use @JsonProperty("field_name")
    @Schema(description = "ISO codes of countries that are added as members", example = "[096, 116]")
    private Set<String> addMemberCodes;

    @Schema(description = "ISO codes of countries that are removed as members", example = "[096, 116]")
    private Set<String> removeMemberCodes;
}