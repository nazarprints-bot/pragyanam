import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import StudentCourses from "./pages/StudentCourses";
import Tests from "./pages/Tests";
import Doubts from "./pages/Doubts";
import Progress from "./pages/Progress";
import TeacherUpload from "./pages/TeacherUpload";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AITestGenerator from "./pages/AITestGenerator";
import ManualTestCreator from "./pages/ManualTestCreator";
import TestResponses from "./pages/TestResponses";
import LiveClasses from "./pages/LiveClasses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/courses" element={<ProtectedRoute allowedRoles={["student"]}><StudentCourses /></ProtectedRoute>} />
            <Route path="/dashboard/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
            <Route path="/dashboard/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
            <Route path="/dashboard/progress" element={<ProtectedRoute allowedRoles={["student"]}><Progress /></ProtectedRoute>} />
            <Route path="/dashboard/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />
            <Route path="/dashboard/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/dashboard/upload" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherUpload /></ProtectedRoute>} />
            <Route path="/dashboard/my-courses" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherUpload /></ProtectedRoute>} />
            <Route path="/dashboard/students" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/ai-test" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><AITestGenerator /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/dashboard/all-courses" element={<ProtectedRoute allowedRoles={["admin"]}><StudentCourses /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
