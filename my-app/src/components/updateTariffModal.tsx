// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import type { TradeRate } from "@/types/trade";
// import { toast } from "sonner";

// interface UpdateTariffModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   tariff: TradeRate | null;
//   countries: Array<{ isoCode: string; name: string }>;
//   typeOfTariffs: string[];
// }

// export function UpdateTariffModal({ 
//   isOpen, 
//   onClose, 
//   tariff, 
//   countries, 
//   typeOfTariffs 
// }: UpdateTariffModalProps) {
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

//   useEffect(() => {
//     if (tariff) {
//       setFormData({
//         exportingCountry: tariff.exportingFrom,
//         importingCountry: tariff.importingTo,
//         description: tariff.description,
//         tariffRate: tariff.rate,
//         tariffType: tariff.type,
//         hsnCode: tariff.hsCode,
//         effectiveDate: new Date(tariff.effectiveDate),
//         expirationDate: new Date(tariff.expirationDate),
//       });
//     }
//   }, [tariff]);

//   const handleUpdate = () => {
//     // Your update logic here
//     toast.success("Tariff updated successfully!");
//     onClose();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Update Tariff</DialogTitle>
//         </DialogHeader>

//         {/* Your form content here - same structure as create modal */}
        
//         <DialogFooter>
//           <Button onClick={handleUpdate}>
//             Update Tariff
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }