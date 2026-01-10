import { type PropsWithChildren, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Component that renders children only when user is signed in
 */
export const SignedIn = ({ children }: PropsWithChildren) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : null;
};

/**
 * Component that renders children only when user is signed out
 */
export const SignedOut = ({ children }: PropsWithChildren) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? <>{children}</> : null;
};

/**
 * Sign in button component
 */
export const SignInButton = ({ children }: PropsWithChildren) => {
  const { signIn, loading } = useAuth();
  const handleClick = () => {
    if (!loading) {
      signIn();
    }
  };
  return <div onClick={handleClick}>{children}</div>;
};

/**
 * User button component with dropdown menu
 */
export const UserButton = () => {
  const { user, signOut, loading, sendEmailVerification, refreshUser } =
    useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (loading || !user) return null;

  const handleSignOut = () => {
    signOut();
    setShowMenu(false);
  };

  const handleSendVerification = async () => {
    if (!user || user.emailVerified) return;

    setSendingVerification(true);
    setVerificationMessage(null);

    try {
      await sendEmailVerification();
      await refreshUser();
      setVerificationMessage({
        type: "success",
        message: "Verification email sent! Check your inbox.",
      });
    } catch (error) {
      setVerificationMessage({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send verification email.",
      });
    } finally {
      setSendingVerification(false);
      // Clear message after 5 seconds
      setTimeout(() => setVerificationMessage(null), 5000);
    }
  };

  return (
    <div className="user-button-container" style={{ position: "relative" }}>
      <div
        className="user-avatar"
        style={{ cursor: "pointer" }}
        onClick={() => setShowMenu(!showMenu)}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
            }}
          />
        ) : (
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {user.email?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            className="user-menu"
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: "150px",
              zIndex: 1000,
            }}
          >
            <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: "bold" }}>
                {user.displayName || "User"}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {user.email}
              </div>
              {!user.emailVerified && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#ff9800",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>⚠️</span>
                  <span>Email not verified</span>
                </div>
              )}
              {user.emailVerified && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#4caf50",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>✓</span>
                  <span>Email verified</span>
                </div>
              )}
            </div>
            {verificationMessage && (
              <div
                style={{
                  padding: "8px",
                  marginTop: "8px",
                  fontSize: "12px",
                  backgroundColor:
                    verificationMessage.type === "success"
                      ? "#e8f5e9"
                      : "#ffebee",
                  color:
                    verificationMessage.type === "success"
                      ? "#2e7d32"
                      : "#c62828",
                  borderRadius: "4px",
                  border:
                    verificationMessage.type === "success"
                      ? "1px solid #4caf50"
                      : "1px solid #f44336",
                }}
              >
                {verificationMessage.message}
              </div>
            )}
            {!user.emailVerified && (
              <button
                onClick={handleSendVerification}
                disabled={sendingVerification}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "8px",
                  backgroundColor: "#ff9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: sendingVerification ? "not-allowed" : "pointer",
                  opacity: sendingVerification ? 0.6 : 1,
                  fontSize: "12px",
                }}
              >
                {sendingVerification ? "Sending..." : "Send Verification Email"}
              </button>
            )}
            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "8px",
                backgroundColor: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Hook to get current user
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const { user, loading } = useAuth();
  const fullName = user?.displayName || "";
  const primaryEmail = user?.email || "";

  return {
    user: user
      ? {
          id: user.uid,
          emailAddresses: [{ emailAddress: primaryEmail }],
          firstName: fullName.split(" ")[0] || "",
          lastName: fullName.split(" ").slice(1).join(" ") || "",
          imageUrl: user.photoURL || "",
          primaryEmailAddressId: primaryEmail,
          fullName: fullName,
          primaryEmailAddress: { emailAddress: primaryEmail },
        }
      : null,
    isLoaded: !loading,
  };
};
