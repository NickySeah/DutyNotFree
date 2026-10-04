"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FTA } from "@/types/fta";
import {
  Calendar,
  Users,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import ReactCountryFlag from "react-country-flag";
import { getCountryIsoCode } from "@/utils/countryUtils";

interface FTADetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fta: FTA | null;
}

export function FTADetailsModal({
  isOpen,
  onClose,
  fta,
}: FTADetailsModalProps) {
  const [expandedBloc, setExpandedBloc] = useState<"partyA" | "partyB" | null>(
    null,
  );

  if (!fta) return null;

  const currentDate = new Date();
  const effectiveDate = fta.effectiveDate ? new Date(fta.effectiveDate) : null;
  const expirationDate = fta.expirationDate
    ? new Date(fta.expirationDate)
    : null;

  const isExpired = expirationDate && currentDate > expirationDate;
  const isActive = effectiveDate && currentDate >= effectiveDate && !isExpired;

  const toggleBlocDetails = (party: "partyA" | "partyB") => {
    setExpandedBloc(expandedBloc === party ? null : party);
  };

  const renderPartyWithBloc = (party: FTA["partyA"], partyName: string) => {
    const isBloc = party.type === "BLOC";

    return (
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        {!isBloc && party.country && (
          <ReactCountryFlag
            countryCode={getCountryIsoCode(party.country.name)}
            svg
            style={{ width: "1.5em", height: "1.5em" }}
            className="md:w-8 md:h-8"
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
          <span
            className={`font-medium text-sm md:text-base ${isBloc ? "text-primary" : ""}`}
          >
            {party.name}
          </span>

          {isBloc && party.bloc && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toggleBlocDetails(partyName as "partyA" | "partyB")
              }
              className="h-6 px-2 text-xs w-fit"
            >
              <Users className="h-3 w-3 mr-1" />
              {expandedBloc === partyName ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {isBloc && (
          <Badge
            variant="secondary"
            className="bg-accent text-primary text-xs w-fit"
          >
            BLOC
          </Badge>
        )}
      </div>
    );
  };

  const renderBlocMembers = (party: FTA["partyA"]) => {
    if (
      party.type !== "BLOC" ||
      !party.bloc ||
      !party.bloc.memberCountries.length
    )
      return null;

    return (
      <div className="mt-2 pl-3 md:pl-4 border-l-2 border-border">
        <p className="text-xs md:text-sm font-medium text-foreground mb-2">
          Member Countries:
        </p>
        <div className="flex flex-wrap gap-1">
          {party.bloc.memberCountries.map((country, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[10px] md:text-xs bg-card"
            >
              {country}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-[60vw] max-h-[90vh]">
        <DialogHeader>
          <DialogDescription className="sr-only">
            Agreement parties, effective dates, excluded classifications, and
            special concessions.
          </DialogDescription>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg md:text-2xl font-bold text-foreground break-words">
                {fta.name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                <Badge variant="default" className="text-xs">
                  {fta.type.charAt(0) + fta.type.slice(1).toLowerCase()}
                </Badge>
                <span className="text-xs md:text-sm text-muted-foreground">
                  Free Trade Agreement
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="h-[60vh] md:h-[70vh] pr-2 md:pr-4 overflow-y-auto">
          <div className="space-y-4 md:space-y-6">
            {/* Section 1: Parties */}
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Parties</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2 md:mb-3">
                      Party A
                    </h4>
                    {renderPartyWithBloc(fta.partyA, "partyA")}
                    {expandedBloc === "partyA" && renderBlocMembers(fta.partyA)}
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2 md:mb-3">
                      Party B
                    </h4>
                    {renderPartyWithBloc(fta.partyB, "partyB")}
                    {expandedBloc === "partyB" && renderBlocMembers(fta.partyB)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Dates & Status */}
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Agreement Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Effective Date
                    </h4>
                    <p className="text-base md:text-lg font-semibold break-words">
                      {effectiveDate
                        ? format(effectiveDate, "MMMM do, yyyy")
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Status
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                          isExpired
                            ? "bg-red-500"
                            : isActive
                              ? "bg-green-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <span
                        className={`font-semibold text-xs md:text-base ${
                          isExpired
                            ? "text-destructive"
                            : isActive
                              ? "text-primary"
                              : "text-yellow-600"
                        }`}
                      >
                        {isExpired
                          ? `Expired (${expirationDate ? format(expirationDate, "MMM d, yyyy") : ""})`
                          : isActive
                            ? "Active"
                            : "Not yet effective"}
                      </span>
                    </div>
                    {expirationDate && !isExpired && (
                      <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                        Expires on {format(expirationDate, "MMMM do, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Tariff Information */}
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center space-x-2">
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Tariff Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center">
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Default Rate
                    </h4>
                    <p className="text-xl md:text-2xl font-bold text-primary">
                      {fta.defaultRate}%
                    </p>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Excluded
                    </h4>
                    <p className="text-xl md:text-2xl font-bold text-destructive">
                      {fta.excludedTariffLines?.toLocaleString()}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      Tariff Lines Excluded
                    </p>
                  </div>

                  <div className="text-center">
                    <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                      Concessions
                    </h4>
                    <p className="text-xl md:text-2xl font-bold text-primary">
                      {fta.specialConcessionsCount?.toLocaleString()}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      Special Concessions
                    </p>
                  </div>
                </div>

                {/* Special Concessions Details */}
                {fta.specialConcessions.length > 0 && (
                  <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t">
                    <h4 className="text-xs md:text-sm font-medium text-foreground mb-2 md:mb-3">
                      Special Concessions Details
                    </h4>
                    <div className="space-y-2">
                      {fta.specialConcessions.map((concession) => (
                        <div
                          key={concession.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-accent rounded gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-xs md:text-sm block">
                              {concession.hsCode.code}
                            </span>
                            <p className="text-[10px] md:text-xs text-muted-foreground break-words">
                              {concession.hsCode.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-card text-xs w-fit"
                          >
                            {concession.finalRate}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluded HS Codes */}
                {fta.excludedHsCodes.length > 0 && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                    <h4 className="text-xs md:text-sm font-medium text-foreground mb-2 md:mb-3">
                      Excluded Tariff Lines
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {fta.excludedHsCodes.map((hsCode, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 p-2 bg-destructive/10 rounded text-xs md:text-sm"
                        >
                          <span className="font-mono">{hsCode.code}</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground break-words">
                            {hsCode.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
