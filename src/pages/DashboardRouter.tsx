import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

const StudentHome = lazy(() => import("./StudentHome"));
const Dashboard = lazy(() => import("./Dashboard"));
const Onboarding = lazy(() => import("./Onboarding"));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
  </div>
);

const DashboardRouter = () => {
  const { role, profile } = useAuth();

  // Show onboarding for students who haven't completed it
  if (role === "student" && profile && !(profile as any).onboarding_completed) {
    return (
      <Suspense fallback={<Loader />}>
        <Onboarding />
      </Suspense>
    );
  }

  if (role === "teacher" || role === "admin") {
    return (
      <Suspense fallback={<Loader />}>
        <Dashboard />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loader />}>
      <StudentHome />
    </Suspense>
  );
};

export default DashboardRouter;
