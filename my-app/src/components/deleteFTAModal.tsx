import { useDeleteFTA } from "@/hooks/useDeleteFTA";
import { FTA } from "@/types/fta";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteFTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  fta: FTA | null;
}

export function DeleteFTAModal({ isOpen, onClose, fta }: DeleteFTAModalProps) {
  const { mutate, isPending } = useDeleteFTA();

  const handleDelete = () => {
    if (!fta?.id) {
      toast.error("No FTA ID found for deletion");
      return;
    }

    mutate(fta.id, {
      onSuccess: () => {
        toast.success("FTA deleted successfully!");
        onClose();
      },
      onError: (err) => {
        console.error("Failed to delete FTA", err);
        toast.error("Failed to delete FTA");
      },
    });
  };

  if (!fta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete FTA</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this FTA?</p>
          <p className="font-semibold mt-2">{fta.name}</p>
          <p className="text-sm text-muted-foreground">{fta.name}</p>
          <p className="text-sm text-muted-foreground">
            {fta.partyA.name} - {fta.partyB.name}
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
