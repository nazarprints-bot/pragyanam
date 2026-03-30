import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Brain, MessageCircle, TrendingUp, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, role, profile } = useAuth();
  const { t } = useLanguage();
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
    if (hour < 12) return t("dash.goodMorning");
    if (hour < 17) return t("dash.goodAfternoon");
    return t("dash.goodEvening");
  };

  const statCards = role === "student" ? [
    { icon: BookOpen, label: t("dash.enrolledCourses"), value: stats.courses, color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: Brain, label: t("dash.testsTaken"), value: stats.tests, color: "bg-gold/10 text-gold-warm" },
    { icon: MessageCircle, label: t("dash.doubtsAsked"), value: stats.doubts, color: "bg-emerald/10 text-emerald" },
    { icon: TrendingUp, label: t("dash.avgScore"), value: "—", color: "bg-saffron/10 text-saffron-dark" },
  ] : role === "teacher" ? [
    { icon: BookOpen, label: t("dash.myCourses"), value: stats.courses, color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: Users, label: t("dash.studentsLabel"), value: stats.students, color: "bg-gold/10 text-gold-warm" },
    { icon: Brain, label: t("dash.testsCreated"), value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: MessageCircle, label: t("dash.pendingDoubts"), value: stats.doubts, color: "bg-saffron/10 text-saffron-dark" },
  ] : [
    { icon: Users, label: t("dash.totalUsers"), value: "—", color: "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold" },
    { icon: BookOpen, label: t("dash.totalCourses"), value: stats.courses, color: "bg-gold/10 text-gold-warm" },
    { icon: Brain, label: t("dash.totalTests"), value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: Award, label: t("dash.revenue"), value: "₹0", color: "bg-saffron/10 text-saffron-dark" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="gradient-navy rounded-2xl p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-extrabold font-heading">{greeting()} 👋</h1>
          <p className="text-white/60 mt-1">{profile?.full_name || t("common.user")}, {t("dash.overview")}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border hover:shadow-card transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold font-heading text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4">{t("dash.quickActions")}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {role === "student" && (
              <>
                <QuickAction icon="📚" label={t("dash.browseCourses")} to="/dashboard/courses" />
                <QuickAction icon="📝" label={t("dash.takeTest")} to="/dashboard/tests" />
                <QuickAction icon="❓" label={t("dash.askDoubt")} to="/dashboard/doubts" />
                <QuickAction icon="📊" label={t("dash.viewProgress")} to="/dashboard/progress" />
              </>
            )}
            {role === "teacher" && (
              <>
                <QuickAction icon="📤" label={t("dash.uploadContent")} to="/dashboard/upload" />
                <QuickAction icon="📝" label={t("dash.createTest")} to="/dashboard/tests" />
                <QuickAction icon="💬" label={t("dash.answerDoubts")} to="/dashboard/doubts" />
                <QuickAction icon="👨‍🎓" label={t("dash.viewStudents")} to="/dashboard/students" />
              </>
            )}
            {role === "admin" && (
              <>
                <QuickAction icon="👥" label={t("dash.manageUsers")} to="/dashboard/users" />
                <QuickAction icon="📚" label={t("dash.manageCourses")} to="/dashboard/all-courses" />
                <QuickAction icon="📊" label={t("dash.viewAnalytics")} to="/dashboard/analytics" />
                <QuickAction icon="⚙️" label={t("dash.settings")} to="/dashboard/settings" />
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
    <button onClick={() => navigate(to)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-gold/40 hover:shadow-gold transition-all text-center w-full group">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
};

export default Dashboard;
