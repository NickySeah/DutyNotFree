"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { countries, typeOfTariffs } from "@/lib/testData";
import { useUpdateTariff } from "@/hooks/useUpdateTariff";
import type { TradeRate } from "@/types/trade";

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
  const [formData, setFormData] = useState({
    exportingFrom: "", // changed from exportingCountry
    importingTo: "", // changed from importingCountry
    description: "",
    rate: 0, // changed from tariffRate
    type: "", // changed from tariffType
    hsCode: "",
    flatFee: 0, // added flatFee field
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
  });

  const { mutate, isPending } = useUpdateTariff();

  // Populate form data when tariff prop changes
  useEffect(() => {
    if (tariff && isOpen) {
      // Map the TradeRate properties to form data
      setFormData({
        exportingFrom: tariff.exportingFrom || "",
        importingTo: tariff.importingTo || "",
        description: tariff.description || "",
        rate: tariff.rate || 0,
        type: tariff.type || "",
        hsCode: tariff.hsCode || "",
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

  const resetFormData = () => {
    setFormData({
      exportingFrom: "",
      importingTo: "",
      description: "",
      rate: 0,
      type: "",
      hsCode: "",
      flatFee: 0,
      effectiveDate: undefined,
      expirationDate: undefined,
    });
  };

  const validateForm = () => {
    if (!formData.exportingFrom) {
      toast.error("Please select an exporting country");
      return false;
    }

    if (!formData.importingTo) {
      toast.error("Please select an importing country");
      return false;
    }

    if (formData.exportingFrom === formData.importingTo) {
      toast.error("Exporting and importing countries cannot be the same");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a tariff description");
      return false;
    }

    if (formData.rate < 0) {
      toast.error("Please enter a valid tariff rate greater or equals to 0");
      return false;
    }

    if (formData.rate > 100) {
      toast.error("Tariff rate cannot exceed 100%");
      return false;
    }

    if (!formData.type) {
      toast.error("Please select a tariff type");
      return false;
    }

    if (!formData.hsCode.trim()) {
      toast.error("Please enter an HSN code");
      return false;
    }

    if (!/^\d{6,8}$/.test(formData.hsCode)) {
      toast.error("HSN code must be 6-8 digits");
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

    if (!formData.expirationDate) {
      toast.error("Please select an expiration date");
      return false;
    }

    if (formData.expirationDate <= formData.effectiveDate) {
      toast.error("Expiration date must be after effective date");
      return false;
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

  const handleUpdate = () => {
    if (!tariff?.hsCode) {
      toast.error("No tariff HSCode found for update");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const updatePayload = {
      tariff_id: tariff.tariff_id,    // Required for update
      hsCode: formData.hsCode,
      exportingFrom: formData.exportingFrom,
      importingTo: formData.importingTo,
      description: formData.description,
      rate: formData.rate,
      type: formData.type,
      flatFee: formData.flatFee,
      effectiveDate: formData.effectiveDate!,
      expirationDate: formData.expirationDate!,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Tariff - {tariff.hsCode}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-row justify-between">
          <div>
            <Select
              value={formData.exportingFrom}
              onValueChange={(val) => handleChange("exportingFrom", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Exporting Country">
                  {formData.exportingFrom
                    ? formData.exportingFrom
                    : "Exporting Country"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="self-center">
            <ArrowRight />
          </div>

          <div>
            <Select
              value={formData.importingTo}
              onValueChange={(val) => handleChange("importingTo", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Importing Country">
                  {formData.importingTo
                    ? formData.importingTo
                    : "Importing Country"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Input
            placeholder="Tariff Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-row space-x-4">
          <Input
            placeholder="Tariff Rate (%)"
            type="number"
            value={formData.rate}
            onChange={(e) =>
              handleChange(
                "rate",
                e.target.value ? Number(e.target.value) : 0
              )
            }
          />
           <Input
            placeholder="Flat Fee ($)"
            type="number"
            value={formData.flatFee}
            onChange={(e) =>
              handleChange(
                "flatFee",
                e.target.value ? Number(e.target.value) : 0
              )
            }
          />
          <Select
            value={formData.type}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tariff Type">
                {formData.type ? formData.type : "Tariff Type"}
              </SelectValue>
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

        <div className="mt-4">
          <Input
            placeholder="HSN Code"
            value={formData.hsCode}
            onChange={(e) => handleChange("hsCode", e.target.value)}
            disabled
          />
        </div>

        <div className="mt-4 flex flex-row justify-between">
          {/* Effective Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.effectiveDate
                  ? format(formData.effectiveDate, "PPP")
                  : "Effective Date"}
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

          {/* Expiration Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expirationDate
                  ? format(formData.expirationDate, "PPP")
                  : "Expiration Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                mode="single"
                selected={formData.expirationDate}
                onSelect={(date) => handleChange("expirationDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button disabled={isPending} onClick={handleUpdate}>
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
