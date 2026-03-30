import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { Shield, Swords, GraduationCap, ArrowLeft, BookOpen, Brain, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "army", icon: Swords, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "police", icon: Shield, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "govt", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
];

const CompetitivePrep = () => {
  const { category } = useParams<{ category?: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      let query = supabase.from("courses").select("*").eq("is_published", true);
      
      if (category === "army") {
        query = query.eq("category", "competitive").ilike("title", "%army%");
      } else if (category === "police") {
        query = query.eq("category", "competitive").ilike("title", "%police%");
      } else if (category === "govt") {
        query = query.eq("category", "competitive");
      } else {
        query = query.eq("category", "competitive");
      }

      const { data } = await query;
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, [category]);

  if (!category) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-16 lg:pb-0">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t("shome.competitivePrep")}</h1>
            <p className="text-sm text-muted-foreground">{t("competitive.selectExam")}</p>
          </div>
          <div className="grid gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/dashboard/classes/competitive/${cat.id}`)}
                  className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-lg transition-all text-left"
                >
                  <div className={`w-14 h-14 rounded-xl ${cat.bg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${cat.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{t(`competitive.${cat.id}Title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`competitive.${cat.id}Desc`)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
        <BottomNav />
      </DashboardLayout>
    );
  }

  const catInfo = categories.find((c) => c.id === category);
  const CatIcon = catInfo?.icon || GraduationCap;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/classes/competitive")} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t(`competitive.${category}Title`)}</h1>
            <p className="text-sm text-muted-foreground">{t(`competitive.${category}Desc`)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <CatIcon className={`w-12 h-12 mx-auto ${catInfo?.color || "text-muted-foreground"} mb-4`} />
            <h3 className="text-lg font-bold text-foreground mb-1">{t("academic.comingSoon")}</h3>
            <p className="text-sm text-muted-foreground">{t("competitive.coursesComingSoon")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/dashboard/course/${course.id}`)}
                className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="h-32 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${catInfo?.bg || "bg-muted"} flex items-center justify-center`}>
                      <CatIcon className={`w-12 h-12 ${catInfo?.color || "text-muted-foreground"} opacity-30`} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground">{language === "hi" && course.title_hi ? course.title_hi : course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> {t("academic.recorded")}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1"><Brain className="w-2.5 h-2.5" /> {t("academic.tests")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default CompetitivePrep;
