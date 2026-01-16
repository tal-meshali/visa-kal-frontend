import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./AuthComponents";
import { getCurrentUser } from "../services/authService";
import LoadingScreen from "./LoadingScreen";
import { useLanguage } from "../contexts/useLanguage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component that checks authentication and optionally admin role
 * before allowing access to a route.
 */
export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { t } = useLanguage();

  // Fetch user data to check role
  const {
    data: userData,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
    enabled: !!user && isUserLoaded,
    retry: false,
  });

  // Show loading while checking auth state or fetching user data
  if (!isUserLoaded || (user && userDataLoading)) {
    return <LoadingScreen message={t.common.loading} />;
  }

  // Redirect to home if not authenticated
  if (!user || userDataError) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check admin role if required
  if (requireAdmin && userData?.role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated and (if required) is admin
  return <>{children}</>;
};
