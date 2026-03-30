import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Brain, MessageCircle, BarChart3, Users, TrendingUp, Award } from "lucide-react";

const Dashboard = () => {
  const { role, profile } = useAuth();
  const [stats, setStats] = useState({ courses: 0, tests: 0, doubts: 0, students: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, testsRes, doubtsRes] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("tests").select("id", { count: "exact", head: true }),
        supabase.from("doubts").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        courses: coursesRes.count || 0,
        tests: testsRes.count || 0,
        doubts: doubtsRes.count || 0,
        students: 0,
      });
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning / सुप्रभात";
    if (hour < 17) return "Good Afternoon / शुभ दोपहर";
    return "Good Evening / शुभ संध्या";
  };

  const statCards = role === "student" ? [
    { icon: BookOpen, label: "Enrolled Courses", labelHi: "नामांकित कोर्स", value: stats.courses, color: "bg-accent text-accent-foreground" },
    { icon: Brain, label: "Tests Taken", labelHi: "दिए गए टेस्ट", value: stats.tests, color: "bg-secondary/10 text-secondary" },
    { icon: MessageCircle, label: "Doubts Asked", labelHi: "पूछे गए डाउट", value: stats.doubts, color: "bg-emerald/10 text-emerald" },
    { icon: TrendingUp, label: "Avg Score", labelHi: "औसत स्कोर", value: "—", color: "bg-gold/10 text-saffron-dark" },
  ] : role === "teacher" ? [
    { icon: BookOpen, label: "My Courses", labelHi: "मेरे कोर्स", value: stats.courses, color: "bg-accent text-accent-foreground" },
    { icon: Users, label: "Students", labelHi: "छात्र", value: stats.students, color: "bg-secondary/10 text-secondary" },
    { icon: Brain, label: "Tests Created", labelHi: "बनाए गए टेस्ट", value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: MessageCircle, label: "Pending Doubts", labelHi: "लंबित डाउट", value: stats.doubts, color: "bg-gold/10 text-saffron-dark" },
  ] : [
    { icon: Users, label: "Total Users", labelHi: "कुल उपयोगकर्ता", value: "—", color: "bg-accent text-accent-foreground" },
    { icon: BookOpen, label: "Total Courses", labelHi: "कुल कोर्स", value: stats.courses, color: "bg-secondary/10 text-secondary" },
    { icon: Brain, label: "Total Tests", labelHi: "कुल टेस्ट", value: stats.tests, color: "bg-emerald/10 text-emerald" },
    { icon: Award, label: "Revenue", labelHi: "राजस्व", value: "₹0", color: "bg-gold/10 text-saffron-dark" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-heading text-foreground">
            {greeting()} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.full_name || "User"}, here's your overview / यहाँ आपका अवलोकन है
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
              <p className="text-xs text-primary">{stat.labelHi}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4">
            Quick Actions / त्वरित कार्य
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {role === "student" && (
              <>
                <QuickAction icon="📚" label="Browse Courses" labelHi="कोर्स देखें" to="/dashboard/courses" />
                <QuickAction icon="📝" label="Take a Test" labelHi="टेस्ट दें" to="/dashboard/tests" />
                <QuickAction icon="❓" label="Ask a Doubt" labelHi="डाउट पूछें" to="/dashboard/doubts" />
                <QuickAction icon="📊" label="View Progress" labelHi="प्रगति देखें" to="/dashboard/progress" />
              </>
            )}
            {role === "teacher" && (
              <>
                <QuickAction icon="📤" label="Upload Content" labelHi="कंटेंट अपलोड" to="/dashboard/upload" />
                <QuickAction icon="📝" label="Create Test" labelHi="टेस्ट बनाएं" to="/dashboard/tests" />
                <QuickAction icon="💬" label="Answer Doubts" labelHi="डाउट के उत्तर" to="/dashboard/doubts" />
                <QuickAction icon="👨‍🎓" label="View Students" labelHi="छात्र देखें" to="/dashboard/students" />
              </>
            )}
            {role === "admin" && (
              <>
                <QuickAction icon="👥" label="Manage Users" labelHi="उपयोगकर्ता प्रबंधन" to="/dashboard/users" />
                <QuickAction icon="📚" label="Manage Courses" labelHi="कोर्स प्रबंधन" to="/dashboard/all-courses" />
                <QuickAction icon="📊" label="View Analytics" labelHi="एनालिटिक्स" to="/dashboard/analytics" />
                <QuickAction icon="⚙️" label="Settings" labelHi="सेटिंग्स" to="/dashboard/settings" />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const QuickAction = ({ icon, label, labelHi, to }: { icon: string; label: string; labelHi: string; to: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-soft transition-all text-center w-full"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{labelHi}</span>
    </button>
  );
};

export default Dashboard;
