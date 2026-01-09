import { useClerkTokenSync } from "../utils/tokenManager";

// Component to sync Clerk token to localStorage
export const ClerkTokenSync = () => {
  useClerkTokenSync();
  return null;
};
