import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap, LayoutDashboard, BookOpen, FileText, Brain,
  MessageCircle, BarChart3, Users, Settings, LogOut, Menu, X,
  Upload, Bell, ChevronDown, Video, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", labelHi: "डैशबोर्ड" },
    { to: "/dashboard/courses", icon: BookOpen, label: "My Courses", labelHi: "मेरे कोर्स" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes", labelHi: "लाइव क्लास" },
    { to: "/dashboard/tests", icon: Brain, label: "Tests", labelHi: "टेस्ट" },
    { to: "/dashboard/doubts", icon: MessageCircle, label: "Doubts", labelHi: "डाउट" },
    { to: "/dashboard/progress", icon: BarChart3, label: "Progress", labelHi: "प्रगति" },
  ];

  const teacherLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", labelHi: "डैशबोर्ड" },
    { to: "/dashboard/my-courses", icon: BookOpen, label: "My Courses", labelHi: "मेरे कोर्स" },
    { to: "/dashboard/upload", icon: Upload, label: "Upload Content", labelHi: "कंटेंट अपलोड" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes", labelHi: "लाइव क्लास" },
    { to: "/dashboard/ai-test", icon: Sparkles, label: "AI Test Generator", labelHi: "AI टेस्ट जनरेटर" },
    { to: "/dashboard/tests", icon: Brain, label: "Manage Tests", labelHi: "टेस्ट प्रबंधन" },
    { to: "/dashboard/doubts", icon: MessageCircle, label: "Student Doubts", labelHi: "छात्र डाउट" },
    { to: "/dashboard/students", icon: Users, label: "Students", labelHi: "छात्र" },
  ];

  const adminLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", labelHi: "डैशबोर्ड" },
    { to: "/dashboard/users", icon: Users, label: "Users", labelHi: "उपयोगकर्ता" },
    { to: "/dashboard/all-courses", icon: BookOpen, label: "All Courses", labelHi: "सभी कोर्स" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes", labelHi: "लाइव क्लास" },
    { to: "/dashboard/ai-test", icon: Sparkles, label: "AI Test Generator", labelHi: "AI टेस्ट जनरेटर" },
    { to: "/dashboard/tests", icon: Brain, label: "Tests", labelHi: "टेस्ट" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics", labelHi: "एनालिटिक्स" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings", labelHi: "सेटिंग्स" },
  ];

  const links = role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-saffron flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-base font-bold font-heading text-foreground">Pragyanam Academy</span>
                <span className="block text-[10px] text-muted-foreground leading-none">प्रज्ञानम्</span>
              </div>
            </Link>
          </div>

          {/* Role Badge */}
          <div className="px-4 py-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              role === "admin" ? "bg-destructive/10 text-destructive" :
              role === "teacher" ? "bg-secondary/20 text-secondary" :
              "bg-accent text-accent-foreground"
            }`}>
              {role === "admin" ? "🧑‍💻 Admin" : role === "teacher" ? "👨‍🏫 Teacher / शिक्षक" : "👨‍🎓 Student / छात्र"}
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <div>
                    <span>{link.label}</span>
                    <span className="block text-[10px] opacity-60">{link.labelHi}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout / लॉगआउट
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
