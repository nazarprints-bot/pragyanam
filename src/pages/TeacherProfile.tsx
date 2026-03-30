import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, BookOpen, Video, Brain, Calendar, Clock, Play, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const TeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      const [profileRes, coursesRes, liveRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", teacherId).single(),
        supabase.from("courses").select("*").eq("created_by", teacherId).eq("is_published", true),
        supabase.from("live_classes").select("*").eq("teacher_id", teacherId).in("status", ["scheduled", "live"]).order("scheduled_at"),
      ]);
      setTeacher(profileRes.data);
      setCourses(coursesRes.data || []);
      setLiveClasses(liveRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [teacherId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-extrabold font-heading text-foreground">{t("teachers.profile")}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !teacher ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t("teachers.notFound")}</p>
          </div>
        ) : (
          <>
            {/* Teacher Card */}
            <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {teacher.avatar_url ? (
                  <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${teacher.avatar_url}`} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{teacher.full_name}</h2>
                {teacher.bio && <p className="text-sm text-muted-foreground mt-1">{teacher.bio}</p>}
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {courses.length} {t("teachers.courses")}</span>
                  <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {liveClasses.length} {t("teachers.upcoming")}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Live Classes */}
            {liveClasses.length > 0 && (
              <section>
                <h3 className="text-lg font-bold font-heading text-foreground mb-3">{t("teachers.upcomingLive")}</h3>
                <div className="space-y-2">
                  {liveClasses.map((c) => (
                    <div key={c.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.status === "live" ? "bg-destructive/10" : "bg-primary/10"}`}>
                        {c.status === "live" ? <Play className="w-5 h-5 text-destructive" /> : <Calendar className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{c.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {c.status === "live" ? "🔴 LIVE NOW" : `${new Date(c.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${new Date(c.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => navigate("/dashboard/live-classes")} variant={c.status === "live" ? "destructive" : "outline"}>
                        {c.status === "live" ? t("shome.joinNow") : t("teachers.viewDetails")}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Courses / Recorded Lectures */}
            <section>
              <h3 className="text-lg font-bold font-heading text-foreground mb-3">{t("teachers.coursesRecorded")}</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("teachers.noCourses")}</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/dashboard/course/${course.id}`)}
                      className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-all"
                    >
                      <div className="h-24 overflow-hidden">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-navy flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-foreground text-sm">{language === "hi" && course.title_hi ? course.title_hi : course.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{course.category}{course.class_level ? ` · ${t("shome.class")} ${course.class_level}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default TeacherProfile;
