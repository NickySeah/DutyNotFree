"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";
import { useUpdateTariff } from "@/hooks/useUpdateTariff";
import type { TradeRate } from "@/types/trade";
import { getCountryIsoCode } from "@/utils/countryUtils";
import ReactCountryFlag from "react-country-flag";
import { getBackendValueFromData } from "@/lib/testData";

interface UpdateTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: TradeRate | null;
}

export function UpdateTariffModal({
  isOpen,
  onClose,
  tariff,
}: UpdateTariffModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    type: "",
    rate: 0,
    flatFee: 0,
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
  });

  // No Expiration state
  const [noExpiration, setNoExpiration] = useState(false);

  // Mutation hook
  const { mutate, isPending } = useUpdateTariff();

  // Populate form data when tariff prop changes
  useEffect(() => {
    if (tariff && isOpen) {
      const hasNoExpiration = !tariff.expirationDate;
      setNoExpiration(hasNoExpiration);

      // Map the TradeRate properties to form data
      setFormData({
        type: tariff.type || "",
        rate: tariff.rate || 0,
        flatFee: tariff.flatFee || 0,
        effectiveDate: tariff.effectiveDate
          ? new Date(tariff.effectiveDate)
          : undefined,
        expirationDate: tariff.expirationDate
          ? new Date(tariff.expirationDate)
          : undefined,
      });
    }
  }, [tariff, isOpen]);

  // Reset form data function
  const resetFormData = () => {
    setFormData({
      type: "",
      rate: 0,
      flatFee: 0,
      effectiveDate: undefined,
      expirationDate: undefined,
    });
  };

  // Form validation function
  const validateForm = () => {
    if (formData.rate < 0) {
      toast.error("Please enter a valid tariff rate greater or equals to 0");
      return false;
    }

    if (formData.rate > 100) {
      toast.error("Tariff rate cannot exceed 100%");
      return false;
    }

    if (formData.flatFee < 0) {
      toast.error("Flat fee cannot be negative");
      return false;
    }

    if (!formData.effectiveDate) {
      toast.error("Please select an effective date");
      return false;
    }

    if (!noExpiration) {
      if (!formData.expirationDate) {
        toast.error("Please select an expiration date");
        return false;
      }

      if (formData.expirationDate <= formData.effectiveDate) {
        toast.error("Expiration date must be after effective date");
        return false;
      }
    }

    return true;
  };

  function handleChange(
    field: keyof typeof formData,
    value: string | Date | undefined | number,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleNoExpirationChange = (checked: boolean) => {
    setNoExpiration(checked);
    if (checked) {
      // Clear expiration date when "No Expiration" is checked
      setFormData((prev) => ({ ...prev, expirationDate: undefined }));
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
      onClose();
    }
  };

  const handleUpdate = () => {
    if (!tariff?.hsCode) {
      toast.error("No tariff HSCode found for update");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const updatePayload = {
      tariff_id: tariff.tariff_id,
      tariffType: formData.type,
      kind: getBackendValueFromData(tariff.type, tariff.rate, tariff.flatFee),
      rate: formData.rate,
      flatFee: formData.flatFee,
      effectiveDate: formData.effectiveDate!,
      expirationDate: noExpiration ? undefined : formData.expirationDate,
    };

    mutate(updatePayload, {
      onSuccess: () => {
        toast.success("Tariff updated successfully!");
        resetFormData();
        onClose();
      },
      onError: (err) => {
        console.error("Failed to update tariff", err);
        toast.error("Failed to update tariff");
      },
    });
  };

  if (!tariff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-semibold text-foreground">
            Update Tariff
          </DialogTitle>
          <div className="text-xs md:text-sm text-muted-foreground font-mono bg-background px-2 md:px-3 py-1.5 md:py-2 rounded-md mt-2 break-all">
            HS Code: {tariff.hsCode}
          </div>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          {/* Trade Route Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 md:p-3 border border-border">
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2">
              Trade Route
            </h3>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="text-center">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">
                  Exporting from
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <ReactCountryFlag
                    countryCode={getCountryIsoCode(tariff.exportingFrom)}
                    svg
                    style={{
                      width: "1.5em",
                      height: "1.5em",
                      borderRadius: "4px",
                    }}
                    className="md:w-10 md:h-10"
                  />
                  <span className="font-medium text-foreground text-xs md:text-sm break-words">
                    {tariff.exportingFrom}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">
                  Importing to
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <ReactCountryFlag
                    countryCode={getCountryIsoCode(tariff.importingTo)}
                    svg
                    style={{
                      width: "1.5em",
                      height: "1.5em",
                      borderRadius: "4px",
                    }}
                    className="md:w-10 md:h-10"
                  />
                  <span className="font-medium text-foreground text-xs md:text-sm break-words">
                    {tariff.importingTo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-background rounded-lg p-2 md:p-3 border border-border">
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2">
              Product Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  Description:
                </span>
                <p className="text-xs md:text-sm text-foreground mt-1 break-words">
                  {tariff.description}
                </p>
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  Tariff Type:
                </span>
                <span className="inline-block ml-2 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium bg-accent text-primary rounded-full">
                  {tariff.type}
                </span>
              </div>
            </div>
          </div>

          {/* Tariff Rate Section */}
          <div className="bg-card rounded-lg p-2 md:p-3 border-2 border-orange-200">
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">
              Tariff Rate Update
            </h3>

            {getBackendValueFromData(
              tariff.type,
              tariff.rate,
              tariff.flatFee,
            ) === "Ad Valorem" ? (
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between p-2 md:p-3 bg-orange-50 rounded-md">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Current Rate:
                  </span>
                  <span className="font-bold text-orange-600 text-base md:text-lg">
                    {tariff.rate}%
                  </span>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">
                    New Tariff Rate (%)
                  </label>
                  <Input
                    placeholder="Enter new tariff rate"
                    type="number"
                    value={formData.rate === 0 ? "" : formData.rate}
                    onChange={(e) =>
                      handleChange(
                        "rate",
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    className="w-full text-base md:text-lg font-medium"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ) : getBackendValueFromData(
                tariff.type,
                tariff.rate,
                tariff.flatFee,
              ) === "Flat Fee" ? (
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between p-2 md:p-3 bg-accent rounded-md">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    Current Flat Fee:
                  </span>
                  <span className="font-bold text-primary text-base md:text-lg">
                    ${tariff.flatFee}
                  </span>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">
                    New Flat Fee ($)
                  </label>
                  <Input
                    placeholder="Enter new flat fee"
                    type="number"
                    value={formData.flatFee === 0 ? "" : formData.flatFee}
                    onChange={(e) =>
                      handleChange(
                        "flatFee",
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                    className="w-full text-base md:text-lg font-medium"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 md:p-4 bg-destructive/10 border border-red-200 rounded-md">
                <span className="text-destructive font-medium text-xs md:text-sm">
                  Unknown tariff type
                </span>
              </div>
            )}
          </div>

          {/* Date Configuration */}
          <div className="bg-card rounded-lg p-2 md:p-3 border border-border">
            <h3 className="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">
              Date Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Effective Date */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-foreground">
                  Effective Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-9 md:h-10 text-xs md:text-sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      {formData.effectiveDate
                        ? format(formData.effectiveDate, "PPP")
                        : "Select effective date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto">
                    <Calendar
                      mode="single"
                      selected={formData.effectiveDate}
                      onSelect={(date) => handleChange("effectiveDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-medium text-foreground">
                  Expiration Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={noExpiration}
                      className={`w-full justify-start text-left font-normal h-9 md:h-10 text-xs md:text-sm ${
                        noExpiration ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      {formData.expirationDate && !noExpiration
                        ? format(formData.expirationDate, "PPP")
                        : "Select expiration date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto">
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
            </div>

            {/* No Expiration Checkbox */}
            <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Checkbox
                  id="no-expiration"
                  checked={noExpiration}
                  onCheckedChange={handleNoExpirationChange}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="no-expiration"
                  className="text-xs md:text-sm font-medium text-foreground cursor-pointer"
                >
                  This tariff has no expiration date
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 md:pt-4 border-t border-border">
          <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleUpdate}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs md:text-sm"
            >
              {isPending ? (
                <>
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Tariff"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
