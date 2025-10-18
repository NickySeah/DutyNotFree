import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client'; // Assuming this is your auth client
import { toast } from 'sonner';

// Define the shape of the variables the mutation function will receive
interface DeleteUserVariables {
  userId: string;
  userName: string | null; // Pass the name for a more informative success message
}

// 1. Define the asynchronous mutation function that will be called
const deleteUser = async ({ userId }: DeleteUserVariables) => {
  const { data: deletedUser, error } = await authClient.admin.removeUser({
    userId,
  });

  if (error) {
    // Let react-query's onError handle it by throwing the error
    throw new Error(error.message || 'Unknown error occurred while deleting user.');
  }

  return deletedUser;
};

// 2. Create the custom hook using useMutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    
    // 3. Define side effects for success and error states
    onSuccess: (data, variables) => {
      // Show a success notification using the user's name
      toast.success(`User ${variables.userName} has been permanently removed.`);
      
      // Invalidate the 'users' query cache to trigger a refetch of the user list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      // Show an error notification
      console.error("Deletion error:", error);
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
}
