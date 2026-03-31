import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Eager load — always needed
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load — only loaded when user navigates
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StudentHome = lazy(() => import("./pages/StudentHome"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const StudentCourses = lazy(() => import("./pages/StudentCourses"));
const AcademicClasses = lazy(() => import("./pages/AcademicClasses"));
const CompetitivePrep = lazy(() => import("./pages/CompetitivePrep"));
const TeachersBrowse = lazy(() => import("./pages/TeachersBrowse"));
const TeacherProfile = lazy(() => import("./pages/TeacherProfile"));
const RecordedLectures = lazy(() => import("./pages/RecordedLectures"));
const Tests = lazy(() => import("./pages/Tests"));
const Doubts = lazy(() => import("./pages/Doubts"));
const Progress = lazy(() => import("./pages/Progress"));
const TeacherUpload = lazy(() => import("./pages/TeacherUpload"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AITestGenerator = lazy(() => import("./pages/AITestGenerator"));
const ManualTestCreator = lazy(() => import("./pages/ManualTestCreator"));
const TestResponses = lazy(() => import("./pages/TestResponses"));
const LiveClasses = lazy(() => import("./pages/LiveClasses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min cache
      gcTime: 1000 * 60 * 5, // 5 min garbage collect
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* Student Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
              <Route path="/dashboard/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
              <Route path="/dashboard/classes" element={<ProtectedRoute><AcademicClasses /></ProtectedRoute>} />
              <Route path="/dashboard/classes/academic/:classLevel" element={<ProtectedRoute><AcademicClasses /></ProtectedRoute>} />
              <Route path="/dashboard/classes/competitive" element={<ProtectedRoute><CompetitivePrep /></ProtectedRoute>} />
              <Route path="/dashboard/classes/competitive/:category" element={<ProtectedRoute><CompetitivePrep /></ProtectedRoute>} />
              <Route path="/dashboard/teachers" element={<ProtectedRoute><TeachersBrowse /></ProtectedRoute>} />
              <Route path="/dashboard/teachers/:teacherId" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
              <Route path="/dashboard/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
              <Route path="/dashboard/doubts" element={<ProtectedRoute><Doubts /></ProtectedRoute>} />
              <Route path="/dashboard/progress" element={<ProtectedRoute allowedRoles={["student"]}><Progress /></ProtectedRoute>} />
              <Route path="/dashboard/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />
              <Route path="/dashboard/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard/recorded" element={<ProtectedRoute><RecordedLectures /></ProtectedRoute>} />
              <Route path="/dashboard/recorded/:classLevel" element={<ProtectedRoute><RecordedLectures /></ProtectedRoute>} />
              <Route path="/dashboard/recorded/:classLevel/:subjectId" element={<ProtectedRoute><RecordedLectures /></ProtectedRoute>} />
              <Route path="/dashboard/recorded/:classLevel/:subjectId/:chapterId" element={<ProtectedRoute><RecordedLectures /></ProtectedRoute>} />

              {/* Teacher Routes */}
              <Route path="/dashboard/upload" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TeacherUpload /></ProtectedRoute>} />
              <Route path="/dashboard/my-courses" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherUpload /></ProtectedRoute>} />
              <Route path="/dashboard/students" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/dashboard/ai-test" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><AITestGenerator /></ProtectedRoute>} />
              <Route path="/dashboard/manual-test" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><ManualTestCreator /></ProtectedRoute>} />
              <Route path="/dashboard/test-responses" element={<ProtectedRoute allowedRoles={["teacher", "admin"]}><TestResponses /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="/dashboard/all-courses" element={<ProtectedRoute allowedRoles={["admin"]}><StudentCourses /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
