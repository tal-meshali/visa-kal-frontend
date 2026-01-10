import { useFirebaseTokenSync } from "../utils/tokenManager";

// Component to sync Firebase token to localStorage
export const FirebaseTokenSync = () => {
  useFirebaseTokenSync();
  return null;
};

