// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { CalendarIcon, ArrowRight } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { useCreateTariff } from "@/hooks/useCreateTariff";

// interface CreateTariffModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   countries: Array<{ isoCode: string; name: string }>;
//   typeOfTariffs: string[];
// }

// export function CreateTariffModal({
//   isOpen,
//   onClose,
//   countries,
//   typeOfTariffs,
// }: CreateTariffModalProps) {
//   const [formData, setFormData] = useState({
//     exportingCountry: "",
//     importingCountry: "",
//     description: "",
//     tariffRate: 0,
//     tariffType: "",
//     hsnCode: "",
//     effectiveDate: undefined as Date | undefined,
//     expirationDate: undefined as Date | undefined,
//   });

//   const { mutate, isPending } = useCreateTariff();

//   function handleChange(
//     field: keyof typeof formData,
//     value: string | Date | undefined | number
//   ) {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   }

//   const validateForm = () => {
//     // Your existing validation logic here
//     return true;
//   };

//   const handleSubmit = () => {
//     if (!validateForm()) return;

//     mutate(formData, {
//       onSuccess: () => {
//         toast.success("Tariff created successfully!");
//         onClose();
//         resetForm();
//       },
//       onError: () => {
//         toast.error("Failed to create tariff");
//       },
//     });
//   };

//   const resetForm = () => {
//     setFormData({
//       exportingCountry: "",
//       importingCountry: "",
//       description: "",
//       tariffRate: 0,
//       tariffType: "",
//       hsnCode: "",
//       effectiveDate: undefined,
//       expirationDate: undefined,
//     });
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create New Tariff</DialogTitle>
//         </DialogHeader>

//         {/* Your form content here - same as before */}
//         <div className="mt-2 flex flex-row justify-between">
//           <div>
//             <Select
//               onValueChange={(val) => handleChange("exportingCountry", val)}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Exporting Country" />
//               </SelectTrigger>
//               <SelectContent>
//                 {countries.map((country) => (
//                   <SelectItem key={country.isoCode} value={country.isoCode}>
//                     {country.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="self-center">
//             <ArrowRight />
//           </div>

//           <div>
//             <Select
//               onValueChange={(val) => handleChange("importingCountry", val)}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Importing Country" />
//               </SelectTrigger>
//               <SelectContent>
//                 {countries.map((country) => (
//                   <SelectItem key={country.isoCode} value={country.isoCode}>
//                     {country.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <div className="mt-4">
//           <Input
//             placeholder="Tariff Description"
//             value={formData.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//           />
//         </div>

//         <div className="mt-4 flex flex-row space-x-4">
//           <Input
//             placeholder="Tariff Rate (%)"
//             type="number"
//             value={formData.tariffRate}
//             onChange={(e) =>
//               handleChange(
//                 "tariffRate",
//                 e.target.value ? Number(e.target.value) : undefined
//               )
//             }
//           />
//           <Select onValueChange={(val) => handleChange("tariffType", val)}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Tariff Type" />
//             </SelectTrigger>
//             <SelectContent>
//               {typeOfTariffs.map((tariff) => (
//                 <SelectItem key={tariff} value={tariff}>
//                   {tariff}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="mt-4">
//           <Input
//             placeholder="HSN Code"
//             value={formData.hsnCode}
//             onChange={(e) => handleChange("hsnCode", e.target.value)}
//           />
//         </div>

//         <div className="mt-4 flex flex-row justify-between">
//           {/* Effective Date */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline">
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {formData.effectiveDate
//                   ? format(formData.effectiveDate, "PPP")
//                   : "Effective Date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="p-0">
//               <Calendar
//                 mode="single"
//                 selected={formData.effectiveDate}
//                 onSelect={(date) => handleChange("effectiveDate", date)}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>

//           {/* Expiration Date */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline">
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {formData.expirationDate
//                   ? format(formData.expirationDate, "PPP")
//                   : "Expiration Date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="p-0">
//               <Calendar
//                 mode="single"
//                 selected={formData.expirationDate}
//                 onSelect={(date) => handleChange("expirationDate", date)}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>

//         <DialogFooter>
//           <Button onClick={handleSubmit} disabled={isPending}>
//             {isPending ? "Creating..." : "Create Tariff"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
