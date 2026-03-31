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

  // Approval check — unverified teachers & free students see a pending screen
  const needsApproval =
    (role === "teacher" && !profile?.is_verified) ||
    (role === "student" && profile?.is_free_student && !profile?.is_verified);

  if (needsApproval) {
    const isTeacher = role === "teacher";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Approval Pending</h2>
          <p className="text-sm text-muted-foreground">
            {isTeacher
              ? "Your teacher account is under review. Admin will verify and approve your account shortly."
              : "Your free student account is under review. Admin will approve your access shortly."}
          </p>
          <p className="text-xs text-muted-foreground">
            {isTeacher
              ? "आपका शिक्षक खाता समीक्षा में है। एडमिन जल्द ही आपके खाते को सत्यापित और स्वीकृत करेगा।"
              : "आपका निःशुल्क छात्र खाता समीक्षा में है। एडमिन जल्द ही आपकी पहुँच स्वीकृत करेगा।"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
