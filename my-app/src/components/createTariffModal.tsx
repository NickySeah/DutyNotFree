"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

// UI Components
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

// Hooks and Data
import { useCreateTariff } from "@/hooks/useCreateTariff";
import { useHsCodes } from "@/hooks/useHsCodes";
import { useCountries } from "@/hooks/useCountry";
import { typeOfTariffs } from "@/lib/testData";

// Types
interface CreateTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  hsCode: string;
  exportingCountry: string;
  importingCountry: string;
  tariffType: string;
  rate: number;
  flatFee: number;
  effectiveDate: Date | undefined;
  expirationDate: Date | undefined;
}

const initialFormData: FormData = {
  hsCode: "",
  exportingCountry: "",
  importingCountry: "",
  tariffType: "",
  rate: 0,
  flatFee: 0,
  effectiveDate: undefined,
  expirationDate: undefined,
};

export function CreateTariffModal({ isOpen, onClose }: CreateTariffModalProps) {
  // Hooks
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { mutate, isPending } = useCreateTariff();

  // State
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [noExpiration, setNoExpiration] = useState(false);

  // Data transformations
  const countryOptions = countries?.map((country) => ({
    value: country.code,
    label: country.name,
  })) || [];

  const hsCodeOptions = hsCodes?.map((hsCode) => ({
    value: hsCode.code,
    label: `${hsCode.code} - ${hsCode.description}`,
  })) || [];

  // Form handlers
  // Instead of having multiple useState calls, we can have a single state object for the form
  // and a generic change handler that updates the relevant field based on input name or similar.
  // This reduces boilerplate and makes it easier to manage form state.
  const handleChange = (field: keyof FormData, value: string | Date | undefined | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleTariffTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tariffType: value,
      rate: 0,
      flatFee: 0,
    }));
  };

  const handleNoExpirationChange = (checked: boolean) => {
    setNoExpiration(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, expirationDate: undefined }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setNoExpiration(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const validations = [
      {
        condition: !formData.exportingCountry,
        message: "Please select an exporting country"
      },
      {
        condition: !formData.importingCountry,
        message: "Please select an importing country"
      },
      {
        condition: formData.exportingCountry === formData.importingCountry,
        message: "Exporting and importing countries cannot be the same"
      },
      {
        condition: !formData.tariffType,
        message: "Please select a tariff type"
      },
      {
        condition: formData.tariffType === "Ad Valorem" && (formData.rate <= 0 || formData.rate > 100),
        message: formData.rate <= 0 
          ? "Please enter a valid tariff rate greater than or equal to 0"
          : "Tariff rate cannot exceed 100%"
      },
      {
        condition: formData.tariffType === "Flat Fee" && formData.flatFee <= 0,
        message: "Flat fee cannot be negative"
      },
      {
        condition: !formData.hsCode.trim(),
        message: "Please enter an HS code"
      },
      {
        condition: !formData.effectiveDate,
        message: "Please select an effective date"
      },
      {
        condition: !noExpiration && !formData.expirationDate,
        message: "Please select an expiration date"
      },
      {
        condition: !noExpiration && formData.expirationDate && formData.effectiveDate && 
                   formData.expirationDate <= formData.effectiveDate,
        message: "Expiration date must be after effective date"
      }
    ];

    for (const validation of validations) {
      if (validation.condition) {
        toast.error(validation.message);
        return false;
      }
    }

    return true;
  };

  // Submit handler
  const handleSave = () => {
    if (!validateForm()) return;

    const tariffPayload = {
      hsCode: formData.hsCode,
      exportingFrom: formData.exportingCountry,
      importingTo: formData.importingCountry,
      type: formData.tariffType,
      rate: formData.tariffType === "Ad Valorem" ? formData.rate : null,
      flatFee: formData.tariffType === "Flat Fee" ? formData.flatFee : null,
      effectiveDate: formData.effectiveDate!,
      expirationDate: noExpiration ? undefined : formData.expirationDate!,
    };

    mutate(tariffPayload, {
      onSuccess: () => {
        toast.success("Tariff created successfully");
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create tariff");
      },
    });
  };

  // Render helpers
  const renderCountrySelection = () => (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Exporting Country
        </Label>
        <Combobox
          options={countryOptions}
          value={formData.exportingCountry}
          onValueChange={(value) => handleChange("exportingCountry", value)}
          placeholder="Select country"
          searchPlaceholder="Search countries..."
          emptyMessage="No countries found."
          width="w-full"
          loading={countriesLoading}
        />
      </div>

      <div className="mt-6">
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Importing Country
        </Label>
        <Combobox
          options={countryOptions}
          value={formData.importingCountry}
          onValueChange={(value) => handleChange("importingCountry", value)}
          placeholder="Select country"
          searchPlaceholder="Search countries..."
          emptyMessage="No countries found."
          width="w-full"
          loading={countriesLoading}
        />
      </div>
    </div>
  );

  const renderHsCodeSelection = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        HS Code
      </Label>
      <Combobox
        options={hsCodeOptions}
        value={formData.hsCode}
        onValueChange={(value) => handleChange("hsCode", value)}
        placeholder="Select HS Code"
        searchPlaceholder="Search HS codes..."
        emptyMessage="No HS codes found."
        width="w-full"
        loading={hsCodesLoading}
      />
    </div>
  );

  const renderTariffTypeAndRate = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Tariff Type & Rate
      </Label>
      <div className="flex gap-4">
        <div className="flex-1">
          {formData.tariffType === "Ad Valorem" ? (
            <Input
              placeholder="Tariff Rate (%)"
              type="number"
              value={formData.rate === 0 ? "" : formData.rate.toString()}
              onChange={(e) =>
                handleChange("rate", e.target.value === "" ? 0 : Number(e.target.value))
              }
              min="0"
              max="100"
              step="0.01"
            />
          ) : formData.tariffType === "Flat Fee" ? (
            <Input
              placeholder="Flat Fee ($)"
              type="number"
              value={formData.flatFee === 0 ? "" : formData.flatFee.toString()}
              onChange={(e) =>
                handleChange("flatFee", e.target.value === "" ? 0 : Number(e.target.value))
              }
              min="0"
              step="1"
            />
          ) : (
            <Input
              placeholder="Select tariff type first"
              disabled
              value=""
              readOnly
            />
          )}
        </div>

        <Select value={formData.tariffType} onValueChange={handleTariffTypeChange}>
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
    </div>
  );

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

  const renderDateSection = () => (
    <div className="space-y-4">
      {renderDatePicker("Effective Date", formData.effectiveDate, "effectiveDate")}
      
      {renderDatePicker(
        "Expiration Date", 
        formData.expirationDate, 
        "expirationDate", 
        noExpiration
      )}

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
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Define New Tariff
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderCountrySelection()}
          {renderHsCodeSelection()}
          {renderTariffTypeAndRate()}
          {renderDateSection()}
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? "Creating..." : "Create Tariff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}