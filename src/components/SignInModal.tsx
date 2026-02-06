import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FirebaseError } from "firebase/app";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/useLanguage";
import { Button } from "./Button";
import "./SignInModal.css";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const { language, t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn();
      onClose();
    } catch (err) {
      setError(t.auth.error);
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError(t.auth.error);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.weakPassword);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsSignUp(false);
    } catch (err) {
      if (err instanceof FirebaseError) {
        const errorCodeMap: Record<string, string> = {
          "auth/invalid-email": t.auth.invalidEmail,
          "auth/invalid-credential": t.auth.invalidCredentials,
          "auth/user-not-found": t.auth.userNotFound,
          "auth/wrong-password": t.auth.wrongPassword,
          "auth/email-already-in-use": t.auth.emailAlreadyInUse,
          "auth/weak-password": t.auth.weakPassword,
          "auth/too-many-requests": t.auth.tooManyRequests,
        };
        setError(errorCodeMap[err.code] || t.auth.error);
      } else {
        setError(t.auth.error);
      }
      console.error("Email auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsSignUp(false);
    onClose();
  };

  const modalContent = (
    <div className="signin-modal-overlay" onClick={handleClose}>
      <div className="signin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="signin-modal-header">
          <h2 className="signin-modal-title">
            {isSignUp ? t.auth.signUp : t.auth.signIn}
          </h2>
          <button
            className="signin-modal-close"
            onClick={handleClose}
            aria-label={t.auth.close}
          >
            ×
          </button>
        </div>
        <div className="signin-modal-content">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="signin-google-button"
            style={{ marginBottom: "1rem" }}
          >
            {loading ? t.common.loading : t.auth.signInWithGoogle}
          </Button>

          <div className="signin-divider">
            <span>{language === "en" ? "OR" : "או"}</span>
          </div>

          <form onSubmit={handleEmailAuth} className="signin-email-form">
            <div className="signin-form-field">
              <label htmlFor="email">{t.auth.email}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email}
                disabled={loading}
                required
              />
            </div>

            <div className="signin-form-field">
              <label htmlFor="password">{t.auth.password}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.password}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="signin-form-field">
                <label htmlFor="confirmPassword">{t.auth.confirmPassword}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPassword}
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && <div className="signin-error">{error}</div>}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              style={{ marginTop: "1rem" }}
            >
              {loading
                ? isSignUp
                  ? t.auth.signingUp
                  : t.auth.signingIn
                : isSignUp
                ? t.auth.signUpWithEmail
                : t.auth.signInWithEmail}
            </Button>
          </form>

          <div className="signin-toggle">
            {isSignUp ? (
              <span>
                {t.auth.alreadyHaveAccount}{" "}
                <button
                  type="button"
                  className="signin-toggle-link"
                  onClick={() => setIsSignUp(false)}
                >
                  {t.auth.signIn}
                </button>
              </span>
            ) : (
              <span>
                {t.auth.dontHaveAccount}{" "}
                <button
                  type="button"
                  className="signin-toggle-link"
                  onClick={() => setIsSignUp(true)}
                >
                  {t.auth.signUp}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

