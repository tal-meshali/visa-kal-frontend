import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export const CLERK_TOKEN_KEY = "clerk_token";

export const saveTokenToStorage = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(CLERK_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(CLERK_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Failed to save token to localStorage:", error);
  }
};

export const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(CLERK_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Hook to automatically sync Clerk token to localStorage
 * Should be used once at the app level (in App.tsx or main.tsx)
 */
export const useClerkTokenSync = (): void => {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      saveTokenToStorage(null);
      return;
    }

    const syncToken = async (): Promise<void> => {
      try {
        const token = await getToken();
        saveTokenToStorage(token);
      } catch (error) {
        console.error("Failed to sync token:", error);
        saveTokenToStorage(null);
      }
    };

    syncToken();

    // Sync token every 1 minute to refresh it
    const interval = setInterval(syncToken, 1 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [getToken, isSignedIn, isLoaded]);
};
