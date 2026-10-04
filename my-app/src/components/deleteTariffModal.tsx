import { useDeleteTariff } from "@/hooks/useDeleteTariff";
import { TradeRate } from "@/types/trade";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariff: TradeRate | null;
}

export function DeleteTariffModal({
  isOpen,
  onClose,
  tariff,
}: DeleteTariffModalProps) {
  const { mutate, isPending } = useDeleteTariff();

  const handleDelete = () => {
    if (!tariff?.tariff_id) {
      toast.error("No tariff Id found for deletion");
      return;
    }

    mutate(tariff.tariff_id, {
      onSuccess: () => {
        toast.success("Tariff deleted successfully!");
        onClose();
      },
      onError: (err) => {
        console.error("Failed to delete tariff", err);
        toast.error("Failed to delete tariff");
      },
    });
  };

  if (!tariff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tariff</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this tariff?</p>
          <p className="font-semibold mt-2">{tariff.description}</p>
          <p className="text-sm text-muted-foreground">
            HS Code: {tariff.hsCode}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
