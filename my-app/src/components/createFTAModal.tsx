"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, Plus, X, Trash2, Users, Globe } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Hooks and Data
import { useCreateFTA } from "@/hooks/useCreateFTA";
import { useHsCodes } from "@/hooks/useHsCodes";
import { useTradeParties } from "@/hooks/useTradeParties";

// Types
interface CreateFTAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConcessionForm {
  id: string;
  hsCode: string;
  hsCodeDescription: string;
  finalRate: number;
}

interface FormData {
  name: string;
  partyA: string;
  partyB: string;
  defaultRate: number;
  effectiveDate: Date | undefined;
  expirationDate: Date | undefined;
  excludedHsCodes: string[];
  excludedHsCodeDescriptions: { [code: string]: string };
  concessions: ConcessionForm[];
}

const initialFormData: FormData = {
  name: "",
  partyA: "",
  partyB: "",
  defaultRate: 0,
  effectiveDate: undefined,
  expirationDate: undefined,
  excludedHsCodes: [],
  excludedHsCodeDescriptions: {},
  concessions: [],
};

export function CreateFTAModal({ isOpen, onClose }: CreateFTAModalProps) {
  // Hooks
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { data: tradeParties, isLoading: tradePartiesLoading } = useTradeParties();
  const { mutate, isPending } = useCreateFTA();

  // State
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [noExpiration, setNoExpiration] = useState(false);
  const [newExcludedHsCode, setNewExcludedHsCode] = useState("");
  const [effectiveDateText, setEffectiveDateText] = useState("");
  const [expirationDateText, setExpirationDateText] = useState("");
  const [newConcession, setNewConcession] = useState<Omit<ConcessionForm, 'id'>>({ 
    hsCode: "", 
    hsCodeDescription: "",
    finalRate: 0 
  });

  // Data transformations
  const hsCodeOptions = hsCodes?.map((hsCode) => ({
    value: hsCode.code,
    label: `${hsCode.code} - ${hsCode.description}`,
    description: hsCode.description
  })) || [];

  const tradePartyOptions = tradeParties || [];

  // Form handlers
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNoExpirationChange = (checked: boolean) => {
    setNoExpiration(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, expirationDate: undefined }));
    }
  };

  // Excluded HS Codes handlers
  const addExcludedHsCode = (hsCodeValue: string) => {
    const selectedHsCode = hsCodes?.find(hs => hs.code === hsCodeValue);
    if (!selectedHsCode) {
      toast.error("Please select a valid HS Code");
      return;
    }

    if (formData.excludedHsCodes.includes(hsCodeValue)) {
      toast.error("HS Code already excluded");
      return;
    }

    // Check if HS code is already in concessions
    if (formData.concessions.some(c => c.hsCode === hsCodeValue)) {
      toast.error("HS Code already has a concession. Remove concession first.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      excludedHsCodes: [...prev.excludedHsCodes, hsCodeValue],
      excludedHsCodeDescriptions: {
        ...prev.excludedHsCodeDescriptions,
        [hsCodeValue]: selectedHsCode.description
      }
    }));
    setNewExcludedHsCode("");
  };

  const removeExcludedHsCode = (hsCode: string) => {
    setFormData(prev => ({
      ...prev,
      excludedHsCodes: prev.excludedHsCodes.filter(code => code !== hsCode),
      excludedHsCodeDescriptions: Object.fromEntries(
        Object.entries(prev.excludedHsCodeDescriptions).filter(([code]) => code !== hsCode)
      )
    }));
  };

  // Concessions handlers
  const addConcession = () => {
    if (!newConcession.hsCode.trim()) {
      toast.error("Please select an HS Code");
      return;
    }

    if (newConcession.finalRate < 0) {
      toast.error("Final rate cannot be negative");
      return;
    }

    // Check if HS code is already in concessions
    if (formData.concessions.some(c => c.hsCode === newConcession.hsCode)) {
      toast.error("HS Code already has a concession");
      return;
    }

    // Check if HS code is already excluded
    if (formData.excludedHsCodes.includes(newConcession.hsCode)) {
      toast.error("HS Code is excluded. Remove from exclusions first.");
      return;
    }

    const concession: ConcessionForm = {
      id: Math.random().toString(36).substr(2, 9),
      ...newConcession
    };

    setFormData(prev => ({
      ...prev,
      concessions: [...prev.concessions, concession]
    }));
    
    setNewConcession({ hsCode: "", hsCodeDescription: "", finalRate: 0 });
  };

  const removeConcession = (id: string) => {
    setFormData(prev => ({
      ...prev,
      concessions: prev.concessions.filter(c => c.id !== id)
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setNoExpiration(false);
    setNewExcludedHsCode("");
    setNewConcession({ hsCode: "", hsCodeDescription: "", finalRate: 0 });
    setEffectiveDateText("");
    setExpirationDateText("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Please enter FTA name");
      return false;
    }

    if (!formData.partyA.trim()) {
      toast.error("Please select Party A");
      return false;
    }

    if (!formData.partyB.trim()) {
      toast.error("Please select Party B");
      return false;
    }

    if (formData.partyA === formData.partyB) {
      toast.error("Party A and Party B cannot be the same");
      return false;
    }

    if (formData.defaultRate < 0) {
      toast.error("Default rate cannot be negative");
      return false;
    }

    if (!formData.effectiveDate) {
      toast.error("Please select effective date");
      return false;
    }

    if (!noExpiration && !formData.expirationDate) {
      toast.error("Please select expiration date");
      return false;
    }

    if (!noExpiration && formData.expirationDate && formData.effectiveDate && 
        formData.expirationDate <= formData.effectiveDate) {
      toast.error("Expiration date must be after effective date");
      return false;
    }

    // Validate concessions
    for (const concession of formData.concessions) {
      if (concession.finalRate < 0) {
        toast.error(`Concession rate for ${concession.hsCode} cannot be negative`);
        return false;
      }

      if (concession.finalRate == formData.defaultRate) {
        toast.error(`Concession for ${concession.hsCode} is redundant as it has the same rate (${formData.defaultRate}%) as FTA's default rate`);
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const ftaPayload = {
      name: formData.name,
      partyA: formData.partyA,
      partyB: formData.partyB,
      effectiveDate: formData.effectiveDate!,
      expirationDate: noExpiration ? undefined : formData.expirationDate!,
      defaultRate: formData.defaultRate,
      excludedHsCodes: formData.excludedHsCodes,
      concessions: formData.concessions.map(c => ({
        hsCode: c.hsCode,
        finalRate: c.finalRate
      })),
    };

    mutate(ftaPayload, {
      onSuccess: () => {
        toast.success("FTA created successfully");
        resetForm();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create FTA");
      },
    });
  };

  const renderDatePicker = (
    label: string,
    value: Date | undefined,
    field: keyof FormData,
    disabled = false
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`w-full justify-start text-left font-normal ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value && !disabled ? format(value, "PPP") : `Select ${label.toLowerCase()}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => handleChange(field, date)}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const getPartyTypeIcon = (partyValue: string) => {
    const party = tradePartyOptions.find(p => p.value === partyValue);
    return party?.type === 'BLOC' ? <Users className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  const getPartyDescription = (partyValue: string) => {
    const party = tradePartyOptions.find(p => p.value === partyValue);
    return party?.description || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[60vw]! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New FTA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <Input
                  placeholder="Enter name for free trade agreement"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              {/* Party A Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Party A
                  </Label>
                  <Combobox
                    options={tradePartyOptions}
                    value={formData.partyA}
                    onValueChange={(value) => handleChange("partyA", value)}
                    placeholder="Select Party A"
                    searchPlaceholder="Search countries or blocs..."
                    emptyMessage="No trade parties found."
                    width="w-full"
                    loading={tradePartiesLoading}
                  />
                  {formData.partyA && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      {getPartyTypeIcon(formData.partyA)}
                      <span>{getPartyDescription(formData.partyA)}</span>
                    </div>
                  )}
                </div>
                {/* Party B Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Party B
                  </Label>
                  <Combobox
                    options={tradePartyOptions}
                    value={formData.partyB}
                    onValueChange={(value) => handleChange("partyB", value)}
                    placeholder="Select Party B"
                    searchPlaceholder="Search countries or blocs..."
                    emptyMessage="No trade parties found."
                    width="w-full"
                    loading={tradePartiesLoading}
                  />
                  {formData.partyB && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      {getPartyTypeIcon(formData.partyB)}
                      <span>{getPartyDescription(formData.partyB)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600"><i>Note: Order of parties does not matter.</i></p>
              </div>
              {/* Default Rate Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Default Rate (%)
                </Label>
                <Input
                  type="number"
                  placeholder="Enter default rate"
                  value={formData.defaultRate === 0 ? "0" : formData.defaultRate}
                  onChange={(e) => handleChange("defaultRate", e.target.value === "" ? 0 : Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Effective Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Effective Date
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={effectiveDateText}
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        // Allow only numbers and dashes
                        const sanitizedValue = value.replace(/[^\d-]/g, '');
                        
                        // Auto-format as user types
                        let formattedValue = sanitizedValue;
                        if (sanitizedValue.length > 4 && sanitizedValue.charAt(4) !== '-') {
                          formattedValue = sanitizedValue.slice(0, 4) + '-' + sanitizedValue.slice(4);
                        }
                        if (formattedValue.length > 7 && formattedValue.charAt(7) !== '-') {
                          formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
                        }
                        
                        // Limit to 10 characters (YYYY-MM-DD)
                        formattedValue = formattedValue.slice(0, 10);
                        
                        setEffectiveDateText(formattedValue);
                        
                        // Try to parse when we have a complete date
                        if (formattedValue.length === 10) {
                          const parsedDate = parse(formattedValue, "yyyy-MM-dd", new Date());
                          if (isValid(parsedDate)) {
                            handleChange("effectiveDate", parsedDate);
                          }
                        } else if (formattedValue.length === 0) {
                          handleChange("effectiveDate", undefined);
                        }
                      }}
                      onBlur={() => {
                        // When input loses focus, validate and format
                        if (effectiveDateText.length === 10) {
                          const parsedDate = parse(effectiveDateText, "yyyy-MM-dd", new Date());
                          if (isValid(parsedDate)) {
                            setEffectiveDateText(format(parsedDate, "yyyy-MM-dd"));
                            handleChange("effectiveDate", parsedDate);
                          } else {
                            // Invalid date, clear it
                            setEffectiveDateText("");
                            handleChange("effectiveDate", undefined);
                          }
                        } else if (effectiveDateText.length > 0 && effectiveDateText.length < 10) {
                          // Incomplete date, clear it
                          setEffectiveDateText("");
                          handleChange("effectiveDate", undefined);
                        }
                      }}
                      className="font-mono"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="px-3">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.effectiveDate}
                          onSelect={(date) => handleChange("effectiveDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-gray-500">Enter date as YYYY-MM-DD or use calendar</p>
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Expiration Date
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={expirationDateText}
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        // Allow only numbers and dashes
                        const sanitizedValue = value.replace(/[^\d-]/g, '');
                        
                        // Auto-format as user types
                        let formattedValue = sanitizedValue;
                        if (sanitizedValue.length > 4 && sanitizedValue.charAt(4) !== '-') {
                          formattedValue = sanitizedValue.slice(0, 4) + '-' + sanitizedValue.slice(4);
                        }
                        if (formattedValue.length > 7 && formattedValue.charAt(7) !== '-') {
                          formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
                        }
                        
                        // Limit to 10 characters (YYYY-MM-DD)
                        formattedValue = formattedValue.slice(0, 10);
                        
                        setExpirationDateText(formattedValue);
                        
                        // Try to parse when we have a complete date
                        if (formattedValue.length === 10) {
                          const parsedDate = parse(formattedValue, "yyyy-MM-dd", new Date());
                          if (isValid(parsedDate)) {
                            handleChange("effectiveDate", parsedDate);
                          }
                        } else if (formattedValue.length === 0) {
                          handleChange("effectiveDate", undefined);
                        }
                      }}
                      onBlur={() => {
                        // When input loses focus, validate and format
                        if (expirationDateText.length === 10) {
                          const parsedDate = parse(expirationDateText, "yyyy-MM-dd", new Date());
                          if (isValid(parsedDate)) {
                            setExpirationDateText(format(parsedDate, "yyyy-MM-dd"));
                            handleChange("effectiveDate", parsedDate);
                          } else {
                            // Invalid date, clear it
                            setExpirationDateText("");
                            handleChange("effectiveDate", undefined);
                          }
                        } else if (expirationDateText.length > 0 && expirationDateText.length < 10) {
                          // Incomplete date, clear it
                          setExpirationDateText("");
                          handleChange("effectiveDate", undefined);
                        }
                      }}
                      className="font-mono"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="px-3"
                          disabled={noExpiration}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.expirationDate}
                          onSelect={(date) => handleChange("expirationDate", date)}
                          initialFocus
                          disabled={noExpiration}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-gray-500">Enter date as YYYY-MM-DD or use calendar</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="no-expiration"
                    checked={noExpiration}
                    onCheckedChange={handleNoExpirationChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="no-expiration"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    This FTA has no expiration date
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excluded HS Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Excluded HS Codes</CardTitle>
              <p className="text-sm text-gray-600">Select HS Codes to exclude from FTA's benefits</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  HS Code
                </Label>
                <Combobox
                  options={hsCodeOptions}
                  value={newExcludedHsCode}
                  onValueChange={(value) => setNewExcludedHsCode(value)}
                  placeholder="Select HS Code..."
                  searchPlaceholder="Search HS Codes..."
                  emptyMessage="No HS codes found."
                  width="w-full"
                  loading={hsCodesLoading}
                />
                <Button 
                  onClick={() => addExcludedHsCode(newExcludedHsCode)} 
                  variant="outline" 
                  className="w-full mt-2"
                  disabled={!newExcludedHsCode}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Excluded HS Code
                </Button>
              </div>
              
              {formData.excludedHsCodes.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Excluded HS Codes ({formData.excludedHsCodes.length})
                  </Label>
                  <div className="space-y-2">
                    {formData.excludedHsCodes.map((hsCode) => (
                      <div key={hsCode} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-sm font-medium">{hsCode}</span>
                            <span className="text-red-700 text-sm">
                              {formData.excludedHsCodeDescriptions[hsCode]}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExcludedHsCode(hsCode)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Concessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Concessions</CardTitle>
              <p className="text-sm text-gray-600">Define special reduced rates for specific HS Codes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    HS Code
                  </Label>
                  <Combobox
                    options={hsCodeOptions}
                    value={newConcession.hsCode}
                    onValueChange={(value) => {
                      const selectedHsCode = hsCodes?.find(hs => hs.code === value);
                      setNewConcession(prev => ({ 
                        ...prev, 
                        hsCode: value,
                        hsCodeDescription: selectedHsCode?.description || ""
                      }))
                    }}
                    placeholder="Select HS Code"
                    searchPlaceholder="Search HS Codes..."
                    emptyMessage="No HS codes found."
                    width="w-full"
                    loading={hsCodesLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Final Rate (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter final rate"
                    value={newConcession.finalRate === 0 ? "" : newConcession.finalRate}
                    onChange={(e) => setNewConcession(prev => ({ 
                      ...prev, 
                      finalRate: e.target.value === "" ? 0 : Number(e.target.value) 
                    }))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <Button 
                onClick={addConcession} 
                variant="outline" 
                className="w-full"
                disabled={!newConcession.hsCode || newConcession.finalRate === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Concession
              </Button>

              {formData.concessions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Special Concessions ({formData.concessions.length})
                  </Label>
                  <div className="space-y-2">
                    {formData.concessions.map((concession) => (
                      <div key={concession.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="font-mono text-sm font-medium block">{concession.hsCode}</span>
                              <span className="text-green-700 text-xs block">
                                {concession.hsCodeDescription}
                              </span>
                            </div>
                            <span className="text-green-700 font-medium text-lg">{concession.finalRate}%</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConcession(concession.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? "Creating..." : "Create FTA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}