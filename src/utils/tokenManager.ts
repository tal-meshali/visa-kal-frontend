import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSetTokenReady } from "../contexts/TokenReadyContext";

export const FIREBASE_TOKEN_KEY = "firebase_token";

export const saveTokenToStorage = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(FIREBASE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(FIREBASE_TOKEN_KEY);
    }
  } catch (error) {
    console.error("Failed to save token to localStorage:", error);
  }
};

export const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(FIREBASE_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Hook to automatically sync Firebase token to localStorage
 * Should be used once at the app level (in App.tsx or main.tsx)
 */
export const useFirebaseTokenSync = (): void => {
  const { user, loading, getIdToken } = useAuth();
  const setTokenReady = useSetTokenReady();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      saveTokenToStorage(null);
      setTokenReady(false);
      return;
    }

    const syncToken = async (): Promise<void> => {
      try {
        const token = await getIdToken();
        saveTokenToStorage(token);
        setTokenReady(!!token);
      } catch (error) {
        console.error("Failed to sync token:", error);
        saveTokenToStorage(null);
        setTokenReady(false);
      }
    };

    syncToken();

    const interval = setInterval(syncToken, 50 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user, loading, getIdToken, setTokenReady]);
};
