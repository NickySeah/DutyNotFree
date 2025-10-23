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
  // DialogDescription,
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
import { getBackendValueFromData} from "@/lib/testData";

interface UpdateTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: TradeRate | null;
}

export function UpdateTariffModal({isOpen,onClose,tariff,}: UpdateTariffModalProps) {

  // Form state
  const [formData, setFormData] = useState({
    // exportingFrom: "",
    // importingTo: "",
    // description: "",
    // hsCode: "",
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
        // exportingFrom: tariff.exportingFrom || "",
        // importingTo: tariff.importingTo || "",
        // description: tariff.description || "",
        // hsCode: tariff.hsCode || "",
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
      // exportingFrom: "",
      // importingTo: "",
      // description: "",
      type: "",
      // hsCode: "",
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

  function handleChange(field: keyof typeof formData, value: string | Date | undefined | number) {
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
      tariff_id: tariff.tariff_id, // This one just take from the tariff prop
      // hsCode: formData.hsCode,
      // exportingFrom: formData.exportingFrom,
      // importingTo: formData.importingTo,
      // description: formData.description,
      tariffType: formData.type,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Update Tariff
          </DialogTitle>
          <div className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-md mt-2">
            HS Code: {tariff.hsCode}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Route Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Trade Route
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">Exporting from</div>
                <div className="flex items-center justify-center space-x-2">
                  <ReactCountryFlag
                    countryCode={getCountryIsoCode(tariff.exportingFrom)}
                    svg
                    style={{
                      width: "2.5em",
                      height: "2.5em",
                      borderRadius: "4px",
                    }}
                  />
                  <span className="font-medium text-gray-800">
                    {tariff.exportingFrom}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">Importing to</div>
                <div className="flex items-center justify-center space-x-2">
                  <ReactCountryFlag
                    countryCode={getCountryIsoCode(tariff.importingTo)}
                    svg
                    style={{
                      width: "2.5em",
                      height: "2.5em",
                      borderRadius: "4px",
                    }}
                  />
                  <span className="font-medium text-gray-800">
                    {tariff.importingTo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Product Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Description:</span>
                <p className="text-sm text-gray-800 mt-1">
                  {tariff.description}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Tariff Type:</span>
                <span className="inline-block ml-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {tariff.type}
                </span>
              </div>
            </div>
          </div>

          {/* Tariff Rate Section */}
          <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Tariff Rate Update
            </h3>

            {getBackendValueFromData(tariff.type, tariff.rate, tariff.flatFee) === "Ad Valorem" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
                  <span className="text-sm text-gray-600">Current Rate:</span>
                  <span className="font-bold text-orange-600 text-lg">
                    {tariff.rate}%
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Tariff Rate (%)
                  </label>
                  <Input
                    placeholder="Enter new tariff rate"
                    type="number"
                    value={formData.rate === 0 ? "" : formData.rate}
                    onChange={(e) =>
                      handleChange(
                        "rate",
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    className="w-full text-lg font-medium"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ) : getBackendValueFromData(tariff.type, tariff.rate, tariff.flatFee) === "Flat Fee" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm text-gray-600">
                    Current Flat Fee:
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    ${tariff.flatFee}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Flat Fee ($)
                  </label>
                  <Input
                    placeholder="Enter new flat fee"
                    type="number"
                    value={formData.flatFee === 0 ? "" : formData.flatFee}
                    onChange={(e) =>
                      handleChange(
                        "flatFee",
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    className="w-full text-lg font-medium"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-600 font-medium">
                  Unknown tariff type
                </span>
              </div>
            )}
          </div>

          {/* Date Configuration */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Date Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Effective Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Effective Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                <label className="block text-sm font-medium text-gray-700">
                  Expiration Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={noExpiration}
                      className={`w-full justify-start text-left font-normal h-10 ${
                        noExpiration ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
            <div className="mt-3 pt-3 border-t border-gray-100">
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
                  This tariff has no expiration date
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-100">
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleUpdate}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
