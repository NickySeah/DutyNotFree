"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, CalendarIcon } from "lucide-react";
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

import { useCreateTariff } from "@/hooks/useCreateTariff";

import { typeOfTariffs } from "@/lib/testData";

import { useHsCodes } from "@/hooks/useHsCodes";
import { useCountries } from "@/hooks/useCountry";
import { Combobox } from "@/components/ui/combobox";

interface CreateTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTariffModal({ isOpen, onClose }: CreateTariffModalProps) {
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const [formData, setFormData] = useState({
    hsCode: "",
    exportingCountry: "",
    importingCountry: "",
    tariffType: "",
    rate: 0,
    flatFee: 0,
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
  });

  const [noExpiration, setNoExpiration] = useState(false);

  const { mutate, isPending } = useCreateTariff();

  const resetFormData = () => {
    setFormData({
      hsCode: "",
      exportingCountry: "",
      importingCountry: "",
      tariffType: "",
      rate: 0,
      flatFee: 0,
      effectiveDate: undefined,
      expirationDate: undefined,
    });
    setNoExpiration(false); // Reset checkbox state
  };

  const validateForm = () => {
    if (!formData.exportingCountry) {
      toast.error("Please select an exporting country");
      return false;
    }

    if (!formData.importingCountry) {
      toast.error("Please select an importing country");
      return false;
    }

    if (formData.exportingCountry === formData.importingCountry) {
      toast.error("Exporting and importing countries cannot be the same");
      return false;
    }
    if (!formData.tariffType) {
      toast.error("Please select a tariff type");
      return false;
    }
    
    if (formData.tariffType === "Ad Valorem") {
      if (formData.rate < 0) {
        toast.error("Please enter a valid tariff rate greater than or equal to 0");
        return false;
      }
      if (formData.rate > 100) {
        toast.error("Tariff rate cannot exceed 100%");
        return false;
      }
    }

    if (formData.tariffType === "Flat Fee") {
      if (formData.flatFee < 0) {
        toast.error("Flat fee cannot be negative");
        return false;
      }
    }


    if (!formData.hsCode.trim()) {
      toast.error("Please enter an HSN code");
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
    value: string | Date | undefined | number
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
      onClose();
    }
  };

  // Add handler for checkbox
  const handleNoExpirationChange = (checked: boolean) => {
    setNoExpiration(checked);
    if (checked) {
      // Clear expiration date when "No Expiration" is checked
      setFormData((prev) => ({ ...prev, expirationDate: undefined }));
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const tariffPayload = {
      hsCode: formData.hsCode,
      exportingFrom: formData.exportingCountry,
      importingTo: formData.importingCountry,
      type: formData.tariffType,
      rate: formData.tariffType === "Ad Valorem" ? formData.rate : null,
      flatFee: formData.tariffType === "Flat Fee" ? formData.flatFee : null,
      effectiveDate: formData.effectiveDate!,
      expirationDate: noExpiration ? undefined : formData.expirationDate!, // Handle no expiration
    };

    mutate(tariffPayload, {
      onSuccess: () => {
        toast.success("Tariff created successfully");
        resetFormData();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create tariff");
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Define New Tariff</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-row justify-between">
          <div>
            <Combobox
              options={
                countries?.map((country) => ({
                  value: country.code,
                  label: country.name,
                })) || []
              }
              value={formData.exportingCountry}
              onValueChange={(value) => handleChange("exportingCountry", value)}
              placeholder="Exporting Country"
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found."
              width="w-[180px]"
              loading={countriesLoading}
            />
          </div>

          <div className="self-center">
            <ArrowRight />
          </div>

          <div>
            <Combobox
              options={
                countries?.map((country) => ({
                  value: country.code,
                  label: country.name,
                })) || []
              }
              value={formData.importingCountry}
              onValueChange={(value) => handleChange("importingCountry", value)}
              placeholder="Importing Country"
              searchPlaceholder="Search countries..."
              emptyMessage="No countries found."
              width="w-[180px]"
              loading={countriesLoading}
            />
          </div>
        </div>

        <div className="mt-4">
          <Combobox
            options={
              hsCodes?.map((hsCode) => ({
                value: hsCode.code,
                label: `${hsCode.code} - ${hsCode.description}`,
              })) || []
            }
            value={formData.hsCode}
            onValueChange={(value) => handleChange("hsCode", value)}
            placeholder="Select HS Code"
            searchPlaceholder="Search HS codes..."
            emptyMessage="No HS codes found."
            width="w-full"
            loading={hsCodesLoading}
          />
        </div>

        <div className="mt-4 flex flex-row space-x-4">
          {/* Show different inputs based on tariff type, like updateTariffModal */}
          {formData.tariffType === "Ad Valorem" ? (
            <Input
              key="rate-input" // Add key to force remount
              placeholder="Tariff Rate (%)"
              type="number"
              value={formData.rate === 0 ? "" : formData.rate.toString()} // Ensure string value
              onChange={(e) =>
                handleChange(
                  "rate",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              className="flex-1"
              min="0"
              step="0.01"
            />
          ) : formData.tariffType === "Flat Fee" ? (
            <Input
              key="flatfee-input" // Add key to force remount
              placeholder="Flat Fee ($)"
              type="number"
              value={formData.flatFee === 0 ? "" : formData.flatFee.toString()} // Ensure string value
              onChange={(e) =>
                handleChange(
                  "flatFee",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              className="flex-1"
              min="0"
              step="1"
            />
          ) : (
            <Input
              key="disabled-input" // Add key to force remount
              placeholder="Select tariff type first"
              disabled
              className="flex-1"
              value="" // Ensure controlled input
              readOnly
            />
          )}
          
          <Select
            value={formData.tariffType}
            onValueChange={(val) => {
              handleChange("tariffType", val);
              // Reset both values when type changes
              handleChange("rate", 0);
              handleChange("flatFee", 0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tariff Type" />
            </SelectTrigger>
            <SelectContent>
              {typeOfTariffs.map((tariff) => (
                <SelectItem key={tariff} value={tariff}>
                  {tariff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-4">
          {/* Effective Date */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.effectiveDate
                    ? format(formData.effectiveDate, "PPP")
                    : "Select effective date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
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
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={noExpiration}
                  className={`w-full justify-start text-left font-normal ${
                    noExpiration ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expirationDate && !noExpiration
                    ? format(formData.expirationDate, "PPP")
                    : "Select expiration date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
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

          {/* No Expiration Checkbox */}
          <div className="pt-3 border-t border-gray-100">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? "Creating ..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
