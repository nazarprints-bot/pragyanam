import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { GraduationCap, ArrowLeft, BookOpen, User, Video, FileText, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AcademicClasses = () => {
  const { classLevel } = useParams<{ classLevel: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, any>>({});
  const [subjects, setSubjects] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch courses for this class level
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .eq("class_level", classLevel || "")
        .eq("category", "school");

      const courseList = courseData || [];
      setCourses(courseList);

      // Fetch teacher profiles
      const teacherIds = [...new Set(courseList.map((c) => c.created_by).filter(Boolean))];
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", teacherIds);
        const map: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { map[p.user_id] = p; });
        setTeachers(map);
      }

      // Fetch subjects for each course
      const courseIds = courseList.map((c) => c.id);
      if (courseIds.length > 0) {
        const { data: subjectData } = await supabase.from("subjects").select("*").in("course_id", courseIds).order("sort_order");
        const subjectMap: Record<string, any[]> = {};
        (subjectData || []).forEach((s: any) => {
          if (!subjectMap[s.course_id]) subjectMap[s.course_id] = [];
          subjectMap[s.course_id].push(s);
        });
        setSubjects(subjectMap);
      }

      setLoading(false);
    };
    fetchData();
  }, [classLevel]);

  if (!classLevel) {
    // Class selection screen
    const classes = ["6", "7", "8", "9", "10", "11", "12"];
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-16 lg:pb-0">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t("shome.academicClasses")}</h1>
            <p className="text-sm text-muted-foreground">{t("academic.selectClass")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => navigate(`/dashboard/classes/academic/${cls}`)}
                className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">{t("shome.class")} {cls}</span>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/classes")} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t("shome.class")} {classLevel}</h1>
            <p className="text-sm text-muted-foreground">{t("academic.subjectsTeachers")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t("academic.noContent")}</h3>
            <p className="text-sm text-muted-foreground">{t("academic.comingSoon")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const teacher = teachers[course.created_by];
              const courseSubjects = subjects[course.id] || [];
              return (
                <div key={course.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Course header with teacher */}
                  <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-foreground text-lg">{language === "hi" && course.title_hi ? course.title_hi : course.title}</h2>
                    {teacher && (
                      <button
                        onClick={() => navigate(`/dashboard/teachers/${teacher.user_id}`)}
                        className="flex items-center gap-2 mt-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {teacher.avatar_url ? (
                            <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${teacher.avatar_url}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                        </div>
                        <span className="text-sm text-muted-foreground">{teacher.full_name}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Subjects list */}
                  {courseSubjects.length > 0 ? (
                    <div className="divide-y divide-border">
                      {courseSubjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => navigate(`/dashboard/course/${course.id}`)}
                          className="w-full flex items-center justify-between p-3 px-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground text-sm">
                              {language === "hi" && subject.title_hi ? subject.title_hi : subject.title}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        <ActionChip icon={<Video className="w-3 h-3" />} label={t("academic.liveClass")} onClick={() => navigate("/dashboard/live-classes")} />
                        <ActionChip icon={<BookOpen className="w-3 h-3" />} label={t("academic.recorded")} onClick={() => navigate(`/dashboard/course/${course.id}`)} />
                        <ActionChip icon={<FileText className="w-3 h-3" />} label={t("academic.notes")} onClick={() => navigate(`/dashboard/course/${course.id}`)} />
                        <ActionChip icon={<Brain className="w-3 h-3" />} label={t("academic.tests")} onClick={() => navigate("/dashboard/tests")} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

const ActionChip = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors">
    {icon} {label}
  </button>
);

export default AcademicClasses;
