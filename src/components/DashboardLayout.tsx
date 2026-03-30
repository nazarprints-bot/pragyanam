import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap, LayoutDashboard, BookOpen, Brain,
  MessageCircle, BarChart3, Users, Settings, LogOut, Menu,
  Upload, Bell, Video, Sparkles, UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/courses", icon: BookOpen, label: "Courses" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes" },
    { to: "/dashboard/tests", icon: Brain, label: "Tests" },
    { to: "/dashboard/doubts", icon: MessageCircle, label: "Doubts" },
    { to: "/dashboard/progress", icon: BarChart3, label: "Progress" },
    { to: "/dashboard/profile", icon: UserCircle, label: "Profile" },
  ];

  const teacherLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/my-courses", icon: BookOpen, label: "My Courses" },
    { to: "/dashboard/upload", icon: Upload, label: "Upload" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes" },
    { to: "/dashboard/ai-test", icon: Sparkles, label: "AI Tests" },
    { to: "/dashboard/tests", icon: Brain, label: "Tests" },
    { to: "/dashboard/doubts", icon: MessageCircle, label: "Doubts" },
    { to: "/dashboard/students", icon: Users, label: "Students" },
  ];

  const adminLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/users", icon: Users, label: "Users" },
    { to: "/dashboard/all-courses", icon: BookOpen, label: "Courses" },
    { to: "/dashboard/live-classes", icon: Video, label: "Live Classes" },
    { to: "/dashboard/ai-test", icon: Sparkles, label: "AI Tests" },
    { to: "/dashboard/tests", icon: Brain, label: "Tests" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const links = role === "admin" ? adminLinks : role === "teacher" ? teacherLinks : studentLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleLabel = role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md gradient-hero flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-[14px] font-semibold text-foreground tracking-tight">Pragyanam</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 mb-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[12px] font-semibold text-accent-foreground">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-[12px] text-muted-foreground hover:text-destructive h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-[220px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-12 px-4">
            <button className="lg:hidden p-1.5 text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;