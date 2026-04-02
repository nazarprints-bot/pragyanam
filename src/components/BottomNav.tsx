import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Brain, MessageCircle, UserCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tabs = [
    { path: "/dashboard", icon: Home, label: t("bnav.home"), exact: true },
    { path: "/dashboard/classes", icon: BookOpen, label: t("bnav.classes") },
    { path: "/dashboard/tests", icon: Brain, label: t("bnav.tests") },
    { path: "/dashboard/doubts", icon: MessageCircle, label: t("bnav.doubts") },
    { path: "/dashboard/profile", icon: UserCircle, label: t("bnav.profile") },
  ];

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) return location.pathname === tab.path;
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 px-2 rounded-xl transition-all active:scale-90 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-tight ${active ? "font-semibold" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
