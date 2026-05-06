import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { getRoleHomePath, isAdminRole } from "@/lib/auth";
import type { AppRole } from "@/lib/supabase";

function AuthLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
    </div>
  );
}

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
}

export function RoleRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: AppRole[];
}) {
  const { loading, user, profile } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return <Navigate to={getRoleHomePath(profile?.role)} replace />;
  }

  return <>{children}</>;
}

export function LoginRedirect({ children }: { children: ReactNode }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <AuthLoading />;
  if (user && profile?.role) {
    return <Navigate to={isAdminRole(profile.role) ? "/admin" : "/sales"} replace />;
  }

  return <>{children}</>;
}
