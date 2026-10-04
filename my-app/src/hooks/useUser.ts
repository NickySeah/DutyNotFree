import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import type { UserInformation } from "@/types/user";

// 2. Define the core function to fetch and process user data
const getUsersWithProvider = async (): Promise<UserInformation[]> => {
  // First, fetch the list of users from your authentication client
  const { data, error } = await authClient.admin.listUsers({
    query: { limit: 100 },
  });

  if (error) {
    // Let react-query handle the error
    throw new Error(error.message);
  }

  // For each user, create a promise to fetch their providerId from your API
  const usersWithProviderPromises = data.users.map(async (user) => {
    // Helper to convert banned status from boolean/null to number/undefined
    const bannedStatus =
      user.banned === true ? 1 : user.banned === false ? 0 : undefined;

    try {
      const response = await fetch(`/api/user/provider?userId=${user.id}`);

      // If the API call fails, assign a default or error value for providerId
      if (!response.ok) {
        console.error(`API error for user ${user.id}: ${response.statusText}`);
        return {
          ...user,
          role: user.role!,
          image: user.image,
          banned: bannedStatus,
          providerId: "N/A",
        };
      }

      const { providerId } = await response.json();
      // Assert role, handle image, and transform banned status to satisfy UserInformation type
      return {
        ...user,
        role: user.role!,
        image: user.image,
        banned: bannedStatus,
        providerId,
      };
    } catch (e) {
      console.error(`Failed to fetch providerId for user ${user.id}`, e);
      // Return the original user object with an error state for the providerId
      return {
        ...user,
        role: user.role!,
        image: user.image,
        banned: bannedStatus,
        providerId: "Error",
      };
    }
  });

  // Wait for all the individual provider fetch requests to complete
  const usersWithProviderId = await Promise.all(usersWithProviderPromises);

  return usersWithProviderId;
};

// 3. Create the custom hook using useQuery
export function useUsers(enabled = true) {
  return useQuery<UserInformation[], Error>({
    queryKey: ["users"], // A unique key for this query
    enabled,
    queryFn: getUsersWithProvider, // The function that will be called to fetch the data
  });
}
