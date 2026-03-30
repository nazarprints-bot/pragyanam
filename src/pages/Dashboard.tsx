import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Brain, MessageCircle, TrendingUp, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ courses: 0, tests: 0, doubts: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const [courses, tests, doubts] = await Promise.all([
        role === "student"
          ? supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id)
          : supabase.from("courses").select("id", { count: "exact", head: true }),
        role === "student"
          ? supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id)
          : supabase.from("tests").select("id", { count: "exact", head: true }),
        supabase.from("doubts").select("id", { count: "exact", head: true }),
      ]);
      setStats({ courses: courses.count || 0, tests: tests.count || 0, doubts: doubts.count || 0, students: 0 });
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statCards = role === "student" ? [
    { icon: BookOpen, label: "Enrolled Courses", value: stats.courses, color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: Brain, label: "Tests Taken", value: stats.tests, color: "bg-gold/10 text-gold-warm" },
    { icon: MessageCircle, label: "Doubts Asked", value: stats.doubts, color: "bg-emerald/10 text-emerald" },
    { icon: TrendingUp, label: "Avg Score", value: "—", color: "bg-saffron/10 text-saffron-dark" },
  ] : role === "teacher" ? [
    { icon: BookOpen, label: "My Courses", value: stats.courses, color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: Users, label: "Students", value: stats.students, color: "bg-gold/10 text-gold-warm" },
    { icon: Brain, label: "Tests Created", value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: MessageCircle, label: "Pending Doubts", value: stats.doubts, color: "bg-saffron/10 text-saffron-dark" },
  ] : [
    { icon: Users, label: "Total Users", value: "—", color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: BookOpen, label: "Total Courses", value: stats.courses, color: "bg-gold/10 text-gold-warm" },
    { icon: Brain, label: "Total Tests", value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: Award, label: "Revenue", value: "₹0", color: "bg-saffron/10 text-saffron-dark" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="gradient-navy rounded-2xl p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-extrabold font-heading">
            {greeting()} 👋
          </h1>
          <p className="text-white/60 mt-1">
            {profile?.full_name || "User"}, here's your overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-5 border border-border hover:shadow-card transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold font-heading text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {role === "student" && (
              <>
                <QuickAction icon="📚" label="Browse Courses" to="/dashboard/courses" />
                <QuickAction icon="📝" label="Take a Test" to="/dashboard/tests" />
                <QuickAction icon="❓" label="Ask a Doubt" to="/dashboard/doubts" />
                <QuickAction icon="📊" label="View Progress" to="/dashboard/progress" />
              </>
            )}
            {role === "teacher" && (
              <>
                <QuickAction icon="📤" label="Upload Content" to="/dashboard/upload" />
                <QuickAction icon="📝" label="Create Test" to="/dashboard/tests" />
                <QuickAction icon="💬" label="Answer Doubts" to="/dashboard/doubts" />
                <QuickAction icon="👨‍🎓" label="View Students" to="/dashboard/students" />
              </>
            )}
            {role === "admin" && (
              <>
                <QuickAction icon="👥" label="Manage Users" to="/dashboard/users" />
                <QuickAction icon="📚" label="Manage Courses" to="/dashboard/all-courses" />
                <QuickAction icon="📊" label="View Analytics" to="/dashboard/analytics" />
                <QuickAction icon="⚙️" label="Settings" to="/dashboard/settings" />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const QuickAction = ({ icon, label, to }: { icon: string; label: string; to: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-gold/40 hover:shadow-gold transition-all text-center w-full group"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
};

export default Dashboard;
