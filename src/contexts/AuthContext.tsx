/* eslint-disable react-refresh/only-export-components -- context + provider live in same file */
import {
  GoogleAuthProvider,
  applyActionCode,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getIdToken,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        await getIdToken(firebaseUser, false);
        setUser(firebaseUser);
      } catch {
        await firebaseSignOut(auth);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Send email verification if email is not verified (for all auth providers)
    if (result.user && !result.user.emailVerified) {
      try {
        const actionCodeSettings: ActionCodeSettings = {
          url: `${
            window.location.origin
          }/verify-email?email=${encodeURIComponent(result.user.email || "")}`,
          handleCodeInApp: true,
        };
        await sendEmailVerification(result.user, actionCodeSettings);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }
  };

  const signInWithEmailAuth = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
    // Email verification is sent on sign-up, not sign-in
  };

  const signUpWithEmailAuth = async (email: string, password: string): Promise<void> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification for new email/password users
    if (result.user) {
      try {
        const actionCodeSettings: ActionCodeSettings = {
          url: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`,
          handleCodeInApp: true,
        };
        await sendEmailVerification(result.user, actionCodeSettings);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await getIdToken(user, true);
    } catch (error) {
      console.error("Failed to get ID token:", error);
      return null;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!user) {
      throw new Error("No user is signed in");
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }

    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/verify-email?email=${encodeURIComponent(
        user.email || ""
      )}`,
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
  };

  const verifyEmailWithCode = async (actionCode: string): Promise<void> => {
    await applyActionCode(auth, actionCode);
    // Reload current user to get updated emailVerified status
    const currentUser = auth.currentUser;
    if (currentUser) {
      await reload(currentUser);
      // Trigger auth state change to update user in context
      setUser(currentUser);
    }
  };

  const refreshUserData = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await reload(currentUser);
      // Trigger auth state change to update user in context
      setUser(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInWithEmail: signInWithEmailAuth,
        signUpWithEmail: signUpWithEmailAuth,
        signOut,
        getIdToken: getToken,
        sendEmailVerification: sendVerificationEmail,
        verifyEmail: verifyEmailWithCode,
        refreshUser: refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
