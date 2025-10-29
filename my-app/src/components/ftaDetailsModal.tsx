// "use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FTA } from "@/types/fta";
import { Calendar, Users, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import ReactCountryFlag from "react-country-flag";
import { getCountryIsoCode } from "@/utils/countryUtils";

interface FTADetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fta: FTA | null;
}

export function FTADetailsModal({ isOpen, onClose, fta }: FTADetailsModalProps) {
  const [expandedBloc, setExpandedBloc] = useState<'partyA' | 'partyB' | null>(null);

  if (!fta) return null;

  const currentDate = new Date();
  const effectiveDate = fta.effectiveDate ? new Date(fta.effectiveDate) : null;
  const expirationDate = fta.expirationDate ? new Date(fta.expirationDate) : null;
  
  const isExpired = expirationDate && currentDate > expirationDate;
  const isActive = effectiveDate && currentDate >= effectiveDate && !isExpired;

  const toggleBlocDetails = (party: 'partyA' | 'partyB') => {
    setExpandedBloc(expandedBloc === party ? null : party);
  };

  const renderPartyWithBloc = (party: FTA['partyA'], partyName: string) => {
    const isBloc = party.type === 'BLOC';
    
    return (
      <div className="flex items-center space-x-3">
        {!isBloc && party.country && (
          <ReactCountryFlag
            countryCode={getCountryIsoCode(party.country.name)}
            svg
            style={{ width: "2em", height: "2em" }}
          />
        )}
        
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isBloc ? 'text-blue-700' : ''}`}>
            {party.name}
          </span>
          
          {isBloc && party.bloc && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBlocDetails(partyName as 'partyA' | 'partyB')}
              className="h-6 px-2 text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              {expandedBloc === partyName ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {isBloc && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            BLOC
          </Badge>
        )}
      </div>
    );
  };

  const renderBlocMembers = (party: FTA['partyA']) => {
    if (party.type !== 'BLOC' || !party.bloc || !party.bloc.memberCountries.length) return null;

    return (
      <div className="mt-2 pl-4 border-l-2 border-blue-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Member Countries:</p>
        <div className="flex flex-wrap gap-1">
          {party.bloc.memberCountries.map((country, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-white">
              {country}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[60vw]! max-h-[90vh] w-full">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {fta.name}
              </DialogTitle>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant='default'>
                  {fta.type.charAt(0) + fta.type.slice(1).toLowerCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Free Trade Agreement
                </span>
              </div>
            </div>
            {/* <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>


        <div className="h-[70vh] pr-4 overflow-y-auto">
        {/* <ScrollArea className="h-[70vh] pr-4"> */}
          <div className="space-y-6">
            {/* Section 1: Parties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Parties</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Party A</h4>
                    {renderPartyWithBloc(fta.partyA, 'partyA')}
                    {expandedBloc === 'partyA' && renderBlocMembers(fta.partyA)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Party B</h4>
                    {renderPartyWithBloc(fta.partyB, 'partyB')}
                    {expandedBloc === 'partyB' && renderBlocMembers(fta.partyB)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Dates & Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Agreement Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Effective Date</h4>
                    <p className="text-lg font-semibold">
                      {effectiveDate ? format(effectiveDate, "MMMM do, yyyy") : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isExpired ? 'bg-red-500' : isActive ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className={`font-semibold ${
                        isExpired ? 'text-red-600' : isActive ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {isExpired ? `Expired (${expirationDate ? format(expirationDate, "MMM d, yyyy") : ''})` : 
                         isActive ? 'Active' : 'Not yet effective'}
                      </span>
                    </div>
                    {expirationDate && !isExpired && (
                      <p className="text-sm text-gray-500 mt-1">
                        Expires on {format(expirationDate, "MMMM do, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Tariff Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Tariff Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Default Rate</h4>
                    <p className="text-2xl font-bold text-blue-600">{fta.defaultRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {fta.applicableTariffLines?.toLocaleString()} Applicable Tariff Lines
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Excluded</h4>
                    <p className="text-2xl font-bold text-red-600">{fta.excludedTariffLines?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Tariff Lines Excluded</p>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Concessions</h4>
                    <p className="text-2xl font-bold text-green-600">{fta.specialConcessionsCount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Special Concessions</p>
                  </div>
                </div>

                {/* Special Concessions Details */}
                {fta.specialConcessions.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Special Concessions Details</h4>
                    <div className="space-y-2">
                      {fta.specialConcessions.map((concession) => (
                        <div key={concession.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <div>
                            <span className="font-mono text-sm">{concession.hsCode.code}</span>
                            <p className="text-xs text-gray-600">{concession.hsCode.description}</p>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {concession.finalRate}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluded HS Codes */}
                {fta.excludedHsCodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Excluded Tariff Lines</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {fta.excludedHsCodes.map((hsCode, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded text-sm">
                          <span className="font-mono">{hsCode.code}</span>
                          <span className="text-xs text-gray-600 truncate">{hsCode.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        {/* </ScrollArea> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}