import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { Video, BookOpen, Play, Clock, GraduationCap, Shield, Swords, ChevronRight, Calendar, Search, Brain, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const StudentHome = () => {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const isHi = language === "hi";

  useEffect(() => {
    const fetchData = async () => {
      const [liveRes, upcomingRes, coursesRes, enrollRes] = await Promise.all([
        supabase.from("live_classes").select("*").eq("status", "live").order("scheduled_at"),
        supabase.from("live_classes").select("*").eq("status", "scheduled").order("scheduled_at").limit(4),
        supabase.from("courses").select("*, enrollments(count)").eq("is_published", true).limit(20),
        user ? supabase.from("enrollments").select("course_id, courses(*)").eq("user_id", user.id).limit(4) : Promise.resolve({ data: [] }),
      ]);

      setLiveClasses(liveRes.data || []);
      setUpcomingClasses(upcomingRes.data || []);
      const sortedCourses = (coursesRes.data || [])
        .sort((a: any, b: any) => (b.enrollments?.[0]?.count || 0) - (a.enrollments?.[0]?.count || 0))
        .slice(0, 6);
      setPopularCourses(sortedCourses);
      const enrolled = (enrollRes.data || []).map((e: any) => e.courses).filter(Boolean);
      setEnrolledCourses(enrolled);

      // Fetch progress for enrolled courses
      if (user && enrolled.length > 0) {
        const progressMap: Record<string, number> = {};
        for (const course of enrolled) {
          const { count: totalLessons } = await supabase
            .from("lessons")
            .select("id", { count: "exact", head: true })
            .in("chapter_id",
              (await supabase.from("chapters").select("id").in("subject_id",
                (await supabase.from("subjects").select("id").eq("course_id", course.id)).data?.map((s: any) => s.id) || []
              )).data?.map((c: any) => c.id) || []
            );
          const { count: completed } = await supabase
            .from("lesson_progress")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_completed", true);
          progressMap[course.id] = totalLessons ? Math.round(((completed || 0) / totalLessons) * 100) : 0;
        }
        setCourseProgress(progressMap);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dash.goodMorning");
    if (hour < 17) return t("dash.goodAfternoon");
    return t("dash.goodEvening");
  };

  const academicClasses = ["6", "7", "8", "9", "10", "11", "12"];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-0">
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-2 gap-2.5">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
        <BottomNav />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 pb-20 lg:pb-0 animate-slide-up">
        {/* Greeting */}
        <div className="gradient-navy rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-white card-3d">
          <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold font-heading">{greeting()} 👋</h1>
          <p className="text-white/60 text-[11px] sm:text-sm mt-0.5">{profile?.full_name || t("common.user")}, {t("dash.overview")}</p>
        </div>

        {/* Live Now */}
        {liveClasses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">{t("shome.liveNow")}</h2>
            </div>
            <div className="grid gap-3">
              {liveClasses.map((c) => (
                <div key={c.id} className="bg-card rounded-xl p-3 sm:p-4 border-2 border-destructive/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">{c.title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration_minutes} min</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/dashboard/live-classes")} className="bg-destructive hover:bg-destructive/90 text-white shrink-0 text-xs h-8 px-3">
                    <Play className="w-3 h-3 mr-1" /> {t("shome.joinNow")}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Continue Learning — with progress */}
        {enrolledCourses.length > 0 ? (
          <section>
            <SectionHeader title={t("shome.continueLearning")} actionLabel={t("shome.viewAll")} onAction={() => navigate("/dashboard/courses")} />
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {enrolledCourses.slice(0, 4).map((course: any) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/dashboard/course/${course.id}`)}
                  className="bg-card rounded-xl border border-border p-2.5 sm:p-3 cursor-pointer hover:border-primary/30 transition-all card-3d-subtle active:scale-[0.98]"
                >
                  <div className="h-16 sm:h-20 rounded-lg overflow-hidden mb-2">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-navy flex items-center justify-center">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground text-[11px] sm:text-xs line-clamp-2">{course.title}</h3>
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-muted-foreground">{courseProgress[course.id] || 0}%</span>
                    </div>
                    <Progress value={courseProgress[course.id] || 0} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Empty state for no enrolled courses */
          <section className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">
              {isHi ? "अभी कोई कोर्स नहीं जुड़ा" : "No courses enrolled yet"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              {isHi ? "लोकप्रिय कोर्सेज़ ब्राउज़ करें और सीखना शुरू करें!" : "Browse popular courses and start learning!"}
            </p>
            <Button onClick={() => navigate("/dashboard/courses")} className="gradient-navy text-white border-0 hover:opacity-90 text-xs sm:text-sm h-9 px-5">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              {isHi ? "कोर्सेज़ ब्राउज़ करें" : "Browse Courses"}
            </Button>
          </section>
        )}

        {/* Upcoming Live Sessions */}
        {upcomingClasses.length > 0 ? (
          <section>
            <SectionHeader title={t("shome.upcomingLive")} actionLabel={t("shome.viewAll")} onAction={() => navigate("/dashboard/live-classes")} />
            <div className="space-y-2">
              {upcomingClasses.slice(0, 3).map((c) => (
                <div key={c.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3 active:scale-[0.99] transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate">{c.title}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {new Date(c.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {new Date(c.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{isHi ? "कोई लाइव क्लास शेड्यूल नहीं" : "No live classes scheduled"}</p>
              <p className="text-xs text-muted-foreground">{isHi ? "जल्द ही नई कक्षाएँ आएँगी!" : "New classes coming soon!"}</p>
            </div>
          </section>
        )}

        {/* Quick Action Buttons */}
        <section className="grid grid-cols-2 gap-2.5">
          <button onClick={() => navigate("/dashboard/tests")} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Brain className="w-4.5 h-4.5 text-primary" /></div>
            <span className="font-semibold text-foreground text-xs">{isHi ? "टेस्ट दें" : "Take Test"}</span>
          </button>
          <button onClick={() => navigate("/dashboard/doubts")} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><MessageCircle className="w-4.5 h-4.5 text-primary" /></div>
            <span className="font-semibold text-foreground text-xs">{isHi ? "डाउट पूछें" : "Ask Doubt"}</span>
          </button>
        </section>

        {/* Coaching Classes */}
        <section>
          <SectionHeader title={t("shome.academicClasses")} />
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5">
            {academicClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => navigate(`/dashboard/classes/academic/${cls}`)}
                className="bg-card rounded-xl border border-border p-2 sm:p-3 text-center hover:border-primary/40 transition-all group card-3d-subtle btn-press"
              >
                <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-1 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <span className="text-[10px] sm:text-sm font-bold text-foreground whitespace-nowrap">{t("shome.class")} {cls}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Competitive Preparation */}
        <section>
          <SectionHeader title={t("shome.competitivePrep")} actionLabel={t("shome.viewAll")} onAction={() => navigate("/dashboard/classes/competitive")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <CompetitiveCard icon={<Swords className="w-5 h-5 text-amber-600" />} title={t("shome.armyPrep")} desc={t("shome.armyPrepDesc")} onClick={() => navigate("/dashboard/classes/competitive/army")} />
            <CompetitiveCard icon={<Shield className="w-5 h-5 text-blue-600" />} title={t("shome.policePrep")} desc={t("shome.policePrepDesc")} onClick={() => navigate("/dashboard/classes/competitive/police")} />
            <CompetitiveCard icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} title={t("shome.govtExam")} desc={t("shome.govtExamDesc")} onClick={() => navigate("/dashboard/classes/competitive/govt")} />
          </div>
        </section>

        {/* Popular Courses */}
        <section>
          <SectionHeader title={t("shome.popularCourses")} actionLabel={t("shome.viewAll")} onAction={() => navigate("/dashboard/courses")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {popularCourses.slice(0, 6).map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/dashboard/course/${course.id}`)}
                className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-all card-3d-subtle active:scale-[0.98]"
              >
                <div className="h-20 sm:h-24 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-navy flex items-center justify-center">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3">
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{course.category}</span>
                  <h3 className="font-semibold text-foreground text-[11px] sm:text-xs mt-1 line-clamp-2">{course.title}</h3>
                  {course.class_level && <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{t("shome.class")} {course.class_level}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

const SectionHeader = ({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
    <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">{title}</h2>
    {actionLabel && onAction && (
      <button onClick={onAction} className="text-[11px] sm:text-xs text-primary font-medium flex items-center gap-0.5 active:opacity-70">
        {actionLabel} <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

const CompetitiveCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) => (
  <button onClick={onClick} className="bg-card rounded-xl border border-border p-3 sm:p-4 text-left hover:border-primary/30 transition-all group card-3d-subtle btn-press w-full">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-foreground text-xs sm:text-sm">{title}</h3>
    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
  </button>
);

export default StudentHome;
