import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, profile, loading, signOut } = useAuth();

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

  // Disabled account check
  if (profile?.is_disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Account Disabled</h2>
          <p className="text-sm text-muted-foreground">
            Your account has been disabled by the admin. Please contact support.
          </p>
          <p className="text-xs text-muted-foreground">
            आपका खाता एडमिन द्वारा निष्क्रिय कर दिया गया है। कृपया सहायता से संपर्क करें।
          </p>
          <Button variant="outline" onClick={signOut} className="mt-2">Logout</Button>
        </div>
      </div>
    );
  }

  // Trial expiry check for paid students
  if (role === "student" && profile?.subscription_plan === "paid" && profile?.trial_ends_at) {
    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    if (now > trialEnd) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Trial Over!</h2>
            <p className="text-sm text-muted-foreground">
              Your 7-day free trial has ended. Pay ₹299/month to continue enjoying full access.
            </p>
            <p className="text-xs text-muted-foreground">
              आपका 7 दिन का फ्री ट्रायल समाप्त हो गया है। पूर्ण एक्सेस के लिए ₹299/माह का भुगतान करें।
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-2xl font-extrabold text-primary">₹299</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                All videos, live classes, tests, doubt support & certificates
              </p>
            </div>
            <Button variant="outline" onClick={signOut} className="mt-2">Logout</Button>
          </div>
        </div>
      );
    }
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
          <Button variant="outline" onClick={signOut} className="mt-2">Logout</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
