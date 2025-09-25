"use client";

import { useState } from "react";
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
import { useCreateTariff } from "@/hooks/useCreateTariff";

interface CreateTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTariffModal({ isOpen, onClose }: CreateTariffModalProps) {
  const [formData, setFormData] = useState({
    exportingCountry: "",
    importingCountry: "",
    description: "",
    tariffRate: 0,
    tariffType: "",
    hsCode: "",
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
  });

  const { mutate, isPending } = useCreateTariff();

  const resetFormData = () => {
    setFormData({
      exportingCountry: "",
      importingCountry: "",
      description: "",
      tariffRate: 0,
      tariffType: "",
      hsCode: "",
      effectiveDate: undefined,
      expirationDate: undefined,
    });
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

    if (!formData.description.trim()) {
      toast.error("Please enter a tariff description");
      return false;
    }

    if (formData.tariffRate < 0) {
      toast.error("Please enter a valid tariff rate greater or equals to 0");
      return false;
    }

    if (formData.tariffRate > 100) {
      toast.error("Tariff rate cannot exceed 100%");
      return false;
    }

    if (!formData.tariffType) {
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

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const tariffPayload = {
      ...formData,
      effectiveDate: formData.effectiveDate!, // Non-null assertion since validated
      expirationDate: formData.expirationDate!,
    };

    mutate(tariffPayload, {
      onSuccess: () => {
        toast.success("Tariff created successfully!");
        resetFormData();
        onClose();
      },
      onError: (err) => {
        console.error("Failed to create tariff", err);
        toast.error("Failed to create tariff");
        resetFormData();
        onClose();
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
            <Select
              onValueChange={(val) => handleChange("exportingCountry", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Exporting Country" />
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
              onValueChange={(val) => handleChange("importingCountry", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Importing Country" />
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
            value={formData.tariffRate}
            onChange={(e) =>
              handleChange(
                "tariffRate",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          />
          <Select onValueChange={(val) => handleChange("tariffType", val)}>
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

        <div className="mt-4">
          <Input
            placeholder="HSN Code"
            value={formData.hsCode}
            onChange={(e) => handleChange("hsCode", e.target.value)}
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
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}