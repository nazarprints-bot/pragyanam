import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

const StudentHome = lazy(() => import("./StudentHome"));
const Dashboard = lazy(() => import("./Dashboard"));

const DashboardRouter = () => {
  const { role } = useAuth();

  if (role === "teacher" || role === "admin") {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" /></div>}>
        <Dashboard />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" /></div>}>
      <StudentHome />
    </Suspense>
  );
};

export default DashboardRouter;
