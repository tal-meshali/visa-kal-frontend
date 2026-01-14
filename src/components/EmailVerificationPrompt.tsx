import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Component that redirects users to email verification page after first login
 * if their email is not verified
 */
export const EmailVerificationPrompt = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Don't redirect if already on verification page or if still loading
    if (loading || location.pathname === "/verify-email") {
      return;
    }

    // Check if we've already redirected in this session
    const sessionKey = `email_verification_redirected_${user?.uid || ""}`;
    const hasRedirectedThisSession = sessionStorage.getItem(sessionKey);

    // If user is signed in and email is not verified, and we haven't redirected this session
    if (user && !user.emailVerified && !hasRedirectedThisSession && !hasRedirectedRef.current) {
      // Mark as redirected to prevent multiple redirects
      sessionStorage.setItem(sessionKey, "true");
      hasRedirectedRef.current = true;
      // Redirect to email verification page
      navigate("/verify-email");
    } else if (user?.emailVerified) {
      // Clear the session storage if email is verified
      sessionStorage.removeItem(sessionKey);
      hasRedirectedRef.current = false;
    }
  }, [user, loading, location.pathname, navigate]);

  // This component doesn't render anything
  return null;
};

