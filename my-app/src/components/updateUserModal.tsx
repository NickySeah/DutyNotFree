import { toast } from "sonner";
import type { UserInformation } from "@/types/user";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateUser } from "@/hooks/useUpdateUser";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInformation | null;
}

const userRoles = ["supplier", "importer", "admin", "user"];
const DEFAULT_ROLE = "user";

export default function UpdateUserModal({
  isOpen,
  onClose,
  user,
}: UpdateUserModalProps) {
  const { mutate, isPending: isLoading } = useUpdateUser();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
  });

  // Populate form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || DEFAULT_ROLE,
      });
    }
  }, [user]);

  // Functions
  //Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      role: user?.role || DEFAULT_ROLE,
    });
  };

  // Validate form data
  const validateFormData = () => {
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email cannot be empty.");
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    // Validate if the role is one of the allowed values
    if (!userRoles.includes(formData.role)) {
      toast.error("Invalid role selected.");
      return false;
    }

    return true;
  };

  // When close, need to reset form data
  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
      onClose();
    }
  };

  // Handle form field changes (for text inputs)
  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // Handle role change specifically for the Select component
  function handleRoleChange(value: string) {
    setFormData((prev) => ({ ...prev, role: value }));
  }

  // New Update Logic using the custom hook
  const handleUpdate = () => {
    if (!validateFormData()) {
      return;
    }

    if (!user?.id) {
      toast.error("No user Id found for update");
      return;
    }

    // Call the mutate function from the custom hook
    mutate({
      userId: user.id,
      data: {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      },
    },
    {      
      onSuccess: () => {
        onClose(); // Close the modal on success
      }
    });
  };

  // Update Logic
  // const handleUpdate = async () => {

  //   if (!validateFormData()) {
  //     return;
  //   }

  //   if (!user?.id) {
  //     toast.error("No user Id found for update");
  //     return;
  //   }

  //   setIsLoading(true);
  //   // Implement user update logic here
  //   try {
  //     const { data: updatedUser, error } = await authClient.admin.updateUser({
  //       userId: user.id,
  //       // Add other user fields to update here
  //       data: {
  //         name: formData.name,
  //         email: formData.email,
  //         role: formData.role,
  //       },
  //     });

  //     if (error) {
  //       // Handle API error
  //       console.error("Update error:", error);
  //       toast.error(
  //         `Failed to update user: ${error.message || "Unknown error"}`
  //       );
  //     } else {
  //       // Handle success
  //       toast.success(`User ${formData.name} has been successfully updated.`);
  //       console.log("User successfully updated:", updatedUser);
  //       onClose(); // Close the modal on success
  //     }
  //   } catch (e) {
  //     // Handle network or unexpected errors
  //     console.error("Unexpected update error:", e);
  //     toast.error("An unexpected error occurred during update.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>
        {/* Form for updating user details */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="col-span-3"
              disabled={isLoading || user?.providerId !== "credential"}
            />
          </div>
          {/* Role selection dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={handleRoleChange}
              disabled={isLoading || user?.role === "admin"}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          {/* Action buttons are now in the footer */}
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
