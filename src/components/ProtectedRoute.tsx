import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Teacher approval check — unverified teachers see a pending screen
  if (role === "teacher" && !profile?.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Approval Pending</h2>
          <p className="text-sm text-muted-foreground">
            Your teacher account is under review. Admin will verify and approve your account shortly. Please check back later.
          </p>
          <p className="text-xs text-muted-foreground">
            आपका शिक्षक खाता समीक्षा में है। एडमिन जल्द ही आपके खाते को सत्यापित और स्वीकृत करेगा।
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
