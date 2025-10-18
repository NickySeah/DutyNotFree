import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client'; // Assuming this is your auth client
import { toast } from 'sonner';

// Define the shape of the data needed for an update
interface UpdateUserData {
  name: string;
  email: string;
  role: string;
}

// Define what the mutation function receives: userId and the data
interface UpdateUserVariables {
  userId: string;
  data: UpdateUserData;
}

// 1. Define the asynchronous mutation function
const updateUser = async ({ userId, data }: UpdateUserVariables) => {
  const { data: updatedUser, error } = await authClient.admin.updateUser({
    userId,
    data,
  });

  if (error) {
    // Let react-query's onError handle it by throwing an error
    throw new Error(error.message || 'Unknown error occurred while updating user.');
  }

  return updatedUser;
};

// 2. Create the custom hook using useMutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    // 3. Define side effects for success and error states
    onSuccess: (data) => {
      // Show a success notification
      toast.success(`User ${data.name} has been successfully updated.`);
      
      // Invalidate the 'users' query cache to trigger a refetch
      // This will automatically update the data in your table
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      // Show an error notification
      console.error("Update error:", error);
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
}