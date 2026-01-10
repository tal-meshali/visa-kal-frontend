import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "./Alert";
import { Button } from "./Button";
import "./EmailVerification.css";

export const EmailVerification = () => {
  const { user, loading, sendEmailVerification, verifyEmail, refreshUser } =
    useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleEmailVerification = useCallback(
    async (code: string) => {
      if (verifying || !code) return; // Prevent multiple calls or empty code

      setVerifying(true);
      setStatus({ type: null, message: "" });

      try {
        await verifyEmail(code);
        // Wait a bit for Firebase to update, then refresh user data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await refreshUser();

        // Clear URL params
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("oobCode");
        newSearchParams.delete("oobcode");
        newSearchParams.delete("mode");
        newSearchParams.delete("action");
        newSearchParams.delete("actionCode");
        setSearchParams(newSearchParams, { replace: true });

        setStatus({
          type: "success",
          message: "Email verified successfully! You can now use all features.",
        });

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to verify email. The link may have expired. Please request a new verification email.";
        setStatus({
          type: "error",
          message: errorMessage,
        });
        setVerifying(false);
      }
    },
    [
      verifying,
      verifyEmail,
      refreshUser,
      searchParams,
      setSearchParams,
      navigate,
    ]
  );

  useEffect(() => {
    // Handle email verification from link
    // Firebase sends action codes in URL params: oobCode and mode
    const oobCode = searchParams.get("oobCode") || searchParams.get("oobcode");
    const modeParam = searchParams.get("mode");

    // Also check for action parameter (alternative Firebase format)
    const action = searchParams.get("action");
    const actionCodeParam = searchParams.get("actionCode") || oobCode;

    if (
      actionCodeParam &&
      (modeParam === "verifyEmail" || action === "verifyEmail")
    ) {
      handleEmailVerification(actionCodeParam);
    } else if (user && !user.emailVerified) {
      setStatus({
        type: "info",
        message: "Please verify your email address to continue.",
      });
      setAlertOpen(true);
    } else if (user && user.emailVerified) {
      setStatus({
        type: "success",
        message: "Your email address has been verified!",
      });
      setAlertOpen(true);
    }
  }, [searchParams, user, handleEmailVerification]);

  const handleSendVerification = async () => {
    if (!user) {
      setStatus({
        type: "error",
        message: "You must be signed in to send a verification email.",
      });
      setAlertOpen(true);
      return;
    }

    if (user.emailVerified) {
      setStatus({
        type: "success",
        message: "Your email is already verified!",
      });
      setAlertOpen(true);
      return;
    }

    setSending(true);
    setStatus({ type: null, message: "" });
    setAlertOpen(false);

    try {
      await sendEmailVerification();
      setStatus({
        type: "success",
        message:
          "Verification email sent! Please check your inbox and click the verification link.",
      });
      setAlertOpen(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification email. Please try again.";
      setStatus({
        type: "error",
        message: errorMessage,
      });
      setAlertOpen(true);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="email-verification-container">
        <Alert
          type="error"
          message="You must be signed in to verify your email."
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
        />
        <Button variant="primary" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-loading">
          Verifying your email address...
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-content">
        <h2>Email Verification</h2>
        {status.type && (
          <Alert
            type={status.type}
            message={status.message}
            isOpen={alertOpen}
            onClose={() => setAlertOpen(false)}
          />
        )}

        {user.emailVerified ? (
          <div className="email-verification-success">
            <p>✅ Your email address ({user.email}) has been verified!</p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="email-verification-pending">
            <p>
              Please verify your email address ({user.email}) to access all
              features.
            </p>
            <p>
              Check your inbox for the verification email. If you didn't receive
              it, click the button below to send a new one.
            </p>
            <Button
              variant="primary"
              onClick={handleSendVerification}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Verification Email"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
