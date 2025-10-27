import { useDeleteProduct } from "@/hooks/useDeleteProduct";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  product,
}: DeleteProductModalProps) {
  const { mutate, isPending } = useDeleteProduct();

  const handleDelete = () => {
    if (!product?.product_id) {
      toast.error("No Product Id found for deletion");
      return;
    }

    mutate(product.product_id, {
      onSuccess: () => {
        toast.success("Product deleted successfully!");
        onClose();
      },
      onError: (err) => {
        console.error("Failed to delete product", err);
        toast.error("Failed to delete product");
      },
    });
  };

  if (!product) return null;

    return (    // creates pop-up box to confirm deletion
    <Dialog open={isOpen} onOpenChange={onClose}>   
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this product?</p>
          <p className="font-semibold mt-2">{product.name}</p>
          <p className="text-sm text-gray-600">HS Code: {product.hsCode}</p>
          <p className="text-sm text-gray-600">Description: {product.description}</p>
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
