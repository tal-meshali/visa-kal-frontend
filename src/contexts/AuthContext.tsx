import {
  GoogleAuthProvider,
  applyActionCode,
  signOut as firebaseSignOut,
  getIdToken,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
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
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Send email verification if user signed in with email/password and email is not verified
    // For Google Sign-In, email is already verified, but we check anyway
    if (
      result.user &&
      !result.user.emailVerified &&
      result.user.providerData[0]?.providerId === "password"
    ) {
      try {
        await sendEmailVerification(result.user);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
