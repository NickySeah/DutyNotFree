import { toast } from "sonner";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import type { UserInformation } from "@/types/user";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInformation | null;
}

export default function deleteUserModal({
  isOpen,
  onClose,
  user,
}: DeleteUserModalProps) {
  const { mutate, isPending: isLoading } = useDeleteUser();

  const handleDelete = () => {
    if (!user?.id) {
      toast.error("No user Id found for deletion");
      return;
    }

    mutate(
      { userId: user.id, userName: user.name },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // const handleDelete = async () => {
  //   if (!user?.id) {
  //     toast.error("No user Id found for deletion");
  //     return;
  //   }

  //   setIsLoading(true);
  //   // Implement user deletion logic here
  //   try {
  //     // 2. Call the method and pass the actual user.id
  //     const { data: deletedUser, error } = await authClient.admin.removeUser({
  //       userId: user.id,
  //     });

  //     if (error) {
  //       // Handle API error
  //       console.error("Deletion error:", error);
  //       toast.error(
  //         `Failed to delete user: ${error.message || "Unknown error"}`
  //       );
  //     } else {
  //       // Handle success
  //       toast.success(`User ${user.name} has been permanently removed.`);
  //       console.log("User successfully deleted:", deletedUser);
  //       onClose(); // Close the modal on success
  //     }
  //   } catch (e) {
  //     // Handle network or unexpected errors
  //     console.error("Unexpected deletion error:", e);
  //     toast.error("An unexpected error occurred during deletion.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this User?</p>
          <p className="font-semibold mt-2">{user.name}</p>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
