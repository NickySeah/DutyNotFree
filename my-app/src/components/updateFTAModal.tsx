"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarIcon, Plus, X, Trash2, Users, Globe } from "lucide-react";
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
import { format, parse, isValid } from "date-fns";
import { useUpdateFTA } from "@/hooks/useUpdateFTA";
import { useHsCodes } from "@/hooks/useHsCodes";
import { useTradeParties } from "@/hooks/useTradeParties";
import type { FTA } from "@/types/fta";

interface UpdateFTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  fta: FTA | null;
}

interface ConcessionForm {
  id: string;
  hsCode: string;
  hsCodeDescription: string;
  finalRate: number;
}

export function UpdateFTAModal({ isOpen, onClose, fta }: UpdateFTAModalProps) {
  // Hooks
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { data: tradeParties = [], isLoading: tradePartiesLoading } =
    useTradeParties();
  const { mutate, isPending } = useUpdateFTA();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    defaultRate: 0,
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
    includeHSCodes: [] as string[],
    excludeHSCodes: [] as string[],
    addConcessions: [] as ConcessionForm[],
    removeConcessions: [] as string[],
  });

  // UI state
  const [noExpiration, setNoExpiration] = useState(false);
  const [newIncludeHsCode, setNewIncludeHsCode] = useState("");
  const [newExcludeHsCode, setNewExcludeHsCode] = useState("");
  const [newConcession, setNewConcession] = useState<
    Omit<ConcessionForm, "id">
  >({
    hsCode: "",
    hsCodeDescription: "",
    finalRate: 0,
  });
  const [effectiveDateText, setEffectiveDateText] = useState("");
  const [expirationDateText, setExpirationDateText] = useState("");

  // Data transformations
  const hsCodeOptions = (hsCodes || []).map((hsCode) => ({
    value: hsCode.code,
    label: `${hsCode.code} - ${hsCode.description}`,
    description: hsCode.description,
  }));

  // For Include HS Codes - only show currently excluded HS codes
  const excludedHsCodeOptions = (fta?.excludedHsCodes || []).map((hsCode) => {
    const hsCodeData = hsCodes?.find((hs) => hs.code === hsCode.code);
    return {
      value: hsCode.code,
      label: `${hsCode.code} - ${hsCodeData?.description || hsCode.description}`,
      description: hsCodeData?.description || hsCode.description,
    };
  });

  // For Exclude HS Codes - show all HS codes except already excluded ones
  const availableHsCodeOptions = (hsCodes || [])
    .filter(
      (hsCode) =>
        !fta?.excludedHsCodes?.some((excluded) => excluded.code === hsCode.code)
    )
    .map((hsCode) => ({
      value: hsCode.code,
      label: `${hsCode.code} - ${hsCode.description}`,
      description: hsCode.description,
    }));

  // Populate form data when fta prop changes
  useEffect(() => {
    if (fta && isOpen) {
      const hasNoExpiration = !fta.expirationDate;
      setNoExpiration(hasNoExpiration);

      // Set date texts
      setEffectiveDateText(
        fta.effectiveDate
          ? format(new Date(fta.effectiveDate), "yyyy-MM-dd")
          : ""
      );
      setExpirationDateText(
        fta.expirationDate
          ? format(new Date(fta.expirationDate), "yyyy-MM-dd")
          : ""
      );

      // Map the FTA properties to form data
      setFormData({
        name: fta.name || "",
        defaultRate: fta.defaultRate || 0,
        effectiveDate: fta.effectiveDate
          ? new Date(fta.effectiveDate)
          : undefined,
        expirationDate: fta.expirationDate
          ? new Date(fta.expirationDate)
          : undefined,
        includeHSCodes: [],
        excludeHSCodes: [],
        addConcessions: [],
        removeConcessions: [],
      });
    }
  }, [fta, isOpen]);

  const resetFormData = () => {
    setFormData({
      name: "",
      defaultRate: 0,
      effectiveDate: undefined,
      expirationDate: undefined,
      includeHSCodes: [],
      excludeHSCodes: [],
      addConcessions: [],
      removeConcessions: [],
    });
    setNoExpiration(false);
    setNewIncludeHsCode("");
    setNewExcludeHsCode("");
    setNewConcession({ hsCode: "", hsCodeDescription: "", finalRate: 0 });
    setEffectiveDateText("");
    setExpirationDateText("");
  };

  const validateForm = () => {
    if (formData.defaultRate < 0) {
      toast.error("Default rate cannot be negative");
      return false;
    }

    if (formData.effectiveDate && !isValid(formData.effectiveDate)) {
      toast.error("Please enter a valid effective date");
      return false;
    }

    if (!noExpiration) {
      if (!formData.expirationDate) {
        toast.error(
          "Please select expiration date when 'no expiration' is unchecked"
        );
        return false;
      }

      if (!isValid(formData.expirationDate)) {
        toast.error("Please enter a valid expiration date");
        return false;
      }

      if (
        formData.expirationDate &&
        formData.effectiveDate &&
        formData.expirationDate <= formData.effectiveDate
      ) {
        toast.error("Expiration date must be after effective date");
        return false;
      }
    }

    // Validate new concessions
    for (const concession of formData.addConcessions) {
      if (concession.finalRate < 0) {
        toast.error(
          `Concession rate for ${concession.hsCode} cannot be negative`
        );
        return false;
      }
    }

    return true;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNoExpirationChange = (checked: boolean) => {
    setNoExpiration(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, expirationDate: undefined }));
      setExpirationDateText("");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
      onClose();
    }
  };

  // Include HS Codes handlers - moving from excluded to included
  const addIncludeHsCode = (hsCodeValue: string) => {
    if (!hsCodeValue.trim()) {
      toast.error("Please select an HS Code");
      return;
    }

    if (formData.includeHSCodes.includes(hsCodeValue)) {
      toast.error("HS Code already selected for inclusion");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      includeHSCodes: [...prev.includeHSCodes, hsCodeValue],
    }));
    setNewIncludeHsCode("");
  };

  const removeIncludeHsCode = (hsCode: string) => {
    setFormData((prev) => ({
      ...prev,
      includeHSCodes: prev.includeHSCodes.filter((code) => code !== hsCode),
    }));
  };

  // Exclude HS Codes handlers - adding new exclusions
  const addExcludeHsCode = (hsCodeValue: string) => {
    if (!hsCodeValue.trim()) {
      toast.error("Please select an HS Code");
      return;
    }

    if (formData.excludeHSCodes.includes(hsCodeValue)) {
      toast.error("HS Code already selected for exclusion");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      excludeHSCodes: [...prev.excludeHSCodes, hsCodeValue],
    }));
    setNewExcludeHsCode("");
  };

  const removeExcludeHsCode = (hsCode: string) => {
    setFormData((prev) => ({
      ...prev,
      excludeHSCodes: prev.excludeHSCodes.filter((code) => code !== hsCode),
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

    // Check if HS code is already in new concessions
    if (
      formData.addConcessions.some((c) => c.hsCode === newConcession.hsCode)
    ) {
      toast.error("HS Code already has a concession to be added");
      return;
    }

    const concession: ConcessionForm = {
      id: Math.random().toString(36).substr(2, 9),
      ...newConcession,
    };

    setFormData((prev) => ({
      ...prev,
      addConcessions: [...prev.addConcessions, concession],
    }));

    setNewConcession({ hsCode: "", hsCodeDescription: "", finalRate: 0 });
  };

  const removeAddedConcession = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      addConcessions: prev.addConcessions.filter((c) => c.id !== id),
    }));
  };

  const removeExistingConcession = (concessionId: number) => {
    setFormData((prev) => ({
      ...prev,
      removeConcessions: [...prev.removeConcessions, concessionId.toString()],
    }));
  };

  const handleUpdate = () => {
    if (!fta?.id) {
      toast.error("No FTA ID found for update");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Build update payload - only include fields that have values
    const updatePayload: any = {
      fta_id: fta.id,
    };

    // Only include fields that were actually modified
    if (formData.name.trim() && formData.name !== fta.name) {
      updatePayload.name = formData.name;
    }
    if (formData.defaultRate !== fta.defaultRate) {
      updatePayload.defaultRate = formData.defaultRate;
    }
    if (
      formData.effectiveDate &&
      formData.effectiveDate !== fta.effectiveDate
    ) {
      updatePayload.effectiveDate = formData.effectiveDate;
    }
    if (formData.expirationDate !== fta.expirationDate) {
      updatePayload.expirationDate = noExpiration
        ? null
        : formData.expirationDate;
    }
    if (formData.includeHSCodes.length > 0) {
      updatePayload.includeHSCodes = formData.includeHSCodes;
    }
    if (formData.excludeHSCodes.length > 0) {
      updatePayload.excludeHSCodes = formData.excludeHSCodes;
    }
    if (formData.addConcessions.length > 0) {
      updatePayload.addConcessions = formData.addConcessions.map((c) => ({
        hsCode: c.hsCode,
        finalRate: c.finalRate,
      }));
    }
    if (formData.removeConcessions.length > 0) {
      updatePayload.removeConcessions = formData.removeConcessions;
    }

    mutate(updatePayload, {
      onSuccess: () => {
        toast.success("FTA updated successfully!");
        resetFormData();
        onClose();
      },
      onError: (err) => {
        console.error("Failed to update FTA", err);
        toast.error("Failed to update FTA");
      },
    });
  };

  if (!fta) return null;

  const getPartyDisplayName = (party: FTA["partyA"]) => {
    if (party.type === "COUNTRY") {
      return `${party.country?.name} (Country)`;
    } else {
      return `${party.bloc?.name} (Bloc - ${party.bloc?.memberCountries.length || 0} members)`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-semibold text-gray-900">
            Update FTA: {fta.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {/* Display Parties (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    Party A
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {fta.partyA.type === "COUNTRY" ? (
                      <Globe className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                    ) : (
                      <Users className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    )}
                    <span className="font-medium text-xs md:text-sm">
                      {getPartyDisplayName(fta.partyA)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    Party B
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {fta.partyB.type === "COUNTRY" ? (
                      <Globe className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                    ) : (
                      <Users className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    )}
                    <span className="font-medium text-xs md:text-sm">
                      {getPartyDisplayName(fta.partyB)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs md:text-sm font-medium text-gray-700">
                  FTA Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1 text-sm"
                  placeholder={fta.name}
                />
              </div>

              <div>
                <Label className="text-xs md:text-sm font-medium text-gray-700">
                  Default Rate (%)
                </Label>
                <Input
                  type="number"
                  value={
                    formData.defaultRate === 0 ? "0" : formData.defaultRate
                  }
                  onChange={(e) =>
                    handleChange(
                      "defaultRate",
                      e.target.value === "" ? 0 : Number(e.target.value)
                    )
                  }
                  className="mt-1 text-sm"
                  min="0"
                  step="0.01"
                  placeholder={fta.defaultRate?.toString()}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Configuration */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Date Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Effective Date */}
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    Effective Date
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={effectiveDateText}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue = value.replace(/[^\d-]/g, "");
                        let formattedValue = sanitizedValue;

                        if (
                          sanitizedValue.length > 4 &&
                          sanitizedValue.charAt(4) !== "-"
                        ) {
                          formattedValue =
                            sanitizedValue.slice(0, 4) +
                            "-" +
                            sanitizedValue.slice(4);
                        }
                        if (
                          formattedValue.length > 7 &&
                          formattedValue.charAt(7) !== "-"
                        ) {
                          formattedValue =
                            formattedValue.slice(0, 7) +
                            "-" +
                            formattedValue.slice(7);
                        }
                        formattedValue = formattedValue.slice(0, 10);

                        setEffectiveDateText(formattedValue);

                        if (formattedValue.length === 10) {
                          const parsedDate = parse(
                            formattedValue,
                            "yyyy-MM-dd",
                            new Date()
                          );
                          if (isValid(parsedDate)) {
                            handleChange("effectiveDate", parsedDate);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (effectiveDateText.length === 10) {
                          const parsedDate = parse(
                            effectiveDateText,
                            "yyyy-MM-dd",
                            new Date()
                          );
                          if (isValid(parsedDate)) {
                            setEffectiveDateText(
                              format(parsedDate, "yyyy-MM-dd")
                            );
                            handleChange("effectiveDate", parsedDate);
                          } else {
                            setEffectiveDateText("");
                            handleChange("effectiveDate", undefined);
                          }
                        }
                      }}
                      className="font-mono text-sm"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="px-2 md:px-3">
                          <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.effectiveDate}
                          onSelect={(date) => {
                            handleChange("effectiveDate", date);
                            setEffectiveDateText(
                              date ? format(date, "yyyy-MM-dd") : ""
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    Enter date as YYYY-MM-DD or use calendar
                  </p>
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    Expiration Date
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={expirationDateText}
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue = value.replace(/[^\d-]/g, "");
                        let formattedValue = sanitizedValue;

                        if (
                          sanitizedValue.length > 4 &&
                          sanitizedValue.charAt(4) !== "-"
                        ) {
                          formattedValue =
                            sanitizedValue.slice(0, 4) +
                            "-" +
                            sanitizedValue.slice(4);
                        }
                        if (
                          formattedValue.length > 7 &&
                          formattedValue.charAt(7) !== "-"
                        ) {
                          formattedValue =
                            formattedValue.slice(0, 7) +
                            "-" +
                            formattedValue.slice(7);
                        }
                        formattedValue = formattedValue.slice(0, 10);

                        setExpirationDateText(formattedValue);

                        if (formattedValue.length === 10) {
                          const parsedDate = parse(
                            formattedValue,
                            "yyyy-MM-dd",
                            new Date()
                          );
                          if (isValid(parsedDate)) {
                            handleChange("expirationDate", parsedDate);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (expirationDateText.length === 10) {
                          const parsedDate = parse(
                            expirationDateText,
                            "yyyy-MM-dd",
                            new Date()
                          );
                          if (isValid(parsedDate)) {
                            setExpirationDateText(
                              format(parsedDate, "yyyy-MM-dd")
                            );
                            handleChange("expirationDate", parsedDate);
                          } else {
                            setExpirationDateText("");
                            handleChange("expirationDate", undefined);
                          }
                        }
                      }}
                      disabled={noExpiration}
                      className={`font-mono text-sm ${noExpiration ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="px-2 md:px-3"
                          disabled={noExpiration}
                        >
                          <CalendarIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.expirationDate}
                          onSelect={(date) => {
                            handleChange("expirationDate", date);
                            setExpirationDateText(
                              date ? format(date, "yyyy-MM-dd") : ""
                            );
                          }}
                          initialFocus
                          disabled={noExpiration}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    Enter date as YYYY-MM-DD or use calendar
                  </p>
                </div>
              </div>

              {/* No Expiration Checkbox */}
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="no-expiration"
                    checked={noExpiration}
                    onCheckedChange={handleNoExpirationChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="no-expiration"
                    className="text-xs md:text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    This FTA has no expiration date
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Include HS Codes - Move from excluded to included */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Add HS Codes in FTA
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-600">
                Select currently excluded HS codes to add to FTA benefits
              </p>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-gray-700">
                  Select Excluded HS Code to Include
                </Label>
                <Combobox
                  options={excludedHsCodeOptions}
                  value={newIncludeHsCode}
                  onValueChange={(value) => setNewIncludeHsCode(value)}
                  placeholder="Select excluded HS code to include..."
                  searchPlaceholder="Search excluded HS codes..."
                  emptyMessage="No excluded HS codes found."
                  width="w-full"
                  loading={hsCodesLoading}
                />
                <Button
                  onClick={() => addIncludeHsCode(newIncludeHsCode)}
                  variant="outline"
                  className="w-full mt-2 text-xs md:text-sm"
                  disabled={!newIncludeHsCode}
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Include Selected HS Code
                </Button>
              </div>

              {formData.includeHSCodes.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    HS Codes to Include ({formData.includeHSCodes.length})
                  </Label>
                  <div className="space-y-2">
                    {formData.includeHSCodes.map((hsCode) => {
                      const hsCodeData = excludedHsCodeOptions.find(
                        (opt) => opt.value === hsCode
                      );
                      return (
                        <div
                          key={hsCode}
                          className="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                              <span className="font-mono text-xs md:text-sm font-medium">
                                {hsCode}
                              </span>
                              <span className="text-green-700 text-xs md:text-sm break-words">
                                {hsCodeData?.description ||
                                  "No description available"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIncludeHsCode(hsCode)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exclude HS Codes - Add new exclusions */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Remove HS Codes from FTA
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-600">
                Add new HS Codes to exclude from FTA benefits
              </p>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-gray-700">
                  Select HS Code to Exclude
                </Label>
                <Combobox
                  options={availableHsCodeOptions}
                  value={newExcludeHsCode}
                  onValueChange={(value) => setNewExcludeHsCode(value)}
                  placeholder="Select HS codes..."
                  searchPlaceholder="Search HS codes..."
                  emptyMessage="No available HS codes found."
                  width="w-full"
                  loading={hsCodesLoading}
                />
                <Button
                  onClick={() => addExcludeHsCode(newExcludeHsCode)}
                  variant="outline"
                  className="w-full mt-2 text-xs md:text-sm"
                  disabled={!newExcludeHsCode}
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Exclude Selected HS Code
                </Button>
              </div>

              {formData.excludeHSCodes.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-xs md:text-sm font-medium text-gray-700">
                    New HS Codes to Exclude ({formData.excludeHSCodes.length})
                  </Label>
                  <div className="space-y-2">
                    {formData.excludeHSCodes.map((hsCode) => {
                      const hsCodeData = availableHsCodeOptions.find(
                        (opt) => opt.value === hsCode
                      );
                      return (
                        <div
                          key={hsCode}
                          className="flex items-center justify-between p-2 md:p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                              <span className="font-mono text-xs md:text-sm font-medium">
                                {hsCode}
                              </span>
                              <span className="text-red-700 text-xs md:text-sm break-words">
                                {hsCodeData?.description ||
                                  "No description available"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExcludeHsCode(hsCode)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Concessions */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Special Concessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Add New Concessions */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="font-medium text-gray-700 text-sm md:text-base">
                  Add New Concessions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-700">
                      HS Code
                    </Label>
                    <Combobox
                      options={availableHsCodeOptions}
                      value={newConcession.hsCode}
                      onValueChange={(value) => {
                        const selectedHsCode = (hsCodes || []).find(
                          (hs) => hs.code === value
                        );
                        setNewConcession((prev) => ({
                          ...prev,
                          hsCode: value,
                          hsCodeDescription:
                            selectedHsCode?.description ||
                            "No description available",
                        }));
                      }}
                      placeholder="Select HS Code"
                      searchPlaceholder="Search HS Codes..."
                      emptyMessage="No HS codes found."
                      width="w-full"
                      loading={hsCodesLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm font-medium text-gray-700">
                      Final Rate (%)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter final rate"
                      value={
                        newConcession.finalRate === 0
                          ? "0"
                          : newConcession.finalRate
                      }
                      onChange={(e) =>
                        setNewConcession((prev) => ({
                          ...prev,
                          finalRate:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                      }
                      min="0"
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={addConcession}
                  variant="outline"
                  className="w-full text-xs md:text-sm"
                  disabled={
                    !newConcession.hsCode || newConcession.finalRate === 0
                  }
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Add Concession
                </Button>

                {formData.addConcessions.length > 0 && (
                  <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-medium text-gray-700">
                      New Concessions to Add ({formData.addConcessions.length})
                    </Label>
                    <div className="space-y-2">
                      {formData.addConcessions.map((concession) => (
                        <div
                          key={concession.id}
                          className="flex items-center justify-between p-2 md:p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                              <div className="flex-1 min-w-0">
                                <span className="font-mono text-xs md:text-sm font-medium block">
                                  {concession.hsCode}
                                </span>
                                <span className="text-green-700 text-[10px] md:text-xs block break-words">
                                  {concession.hsCodeDescription}
                                </span>
                              </div>
                              <span className="text-green-700 font-medium text-sm md:text-lg">
                                {concession.finalRate}%
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddedConcession(concession.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Existing Concessions */}
              {fta.specialConcessions.length > 0 && (
                <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 text-sm md:text-base">
                    Existing Concessions
                  </h4>
                  <div className="space-y-2">
                    {fta.specialConcessions.map((concession) => {
                      const isMarkedForRemoval =
                        formData.removeConcessions.includes(
                          concession.id.toString()
                        );
                      return (
                        <div
                          key={concession.id}
                          className={`flex items-center justify-between p-2 md:p-3 rounded-lg border ${
                            isMarkedForRemoval
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-xs md:text-sm font-medium block">
                                {concession.hsCode.code}
                              </span>
                              <span className="text-gray-600 text-[10px] md:text-xs block break-words">
                                {concession.hsCode.description}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-medium text-sm md:text-lg ${isMarkedForRemoval ? "text-red-700" : "text-gray-700"}`}
                              >
                                {concession.finalRate}%
                              </span>
                              {isMarkedForRemoval && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] md:text-xs"
                                >
                                  Will be removed
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeExistingConcession(concession.id)
                            }
                            disabled={isMarkedForRemoval}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-3 md:pt-4 border-t border-gray-100">
          <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleUpdate}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update FTA"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
