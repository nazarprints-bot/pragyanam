import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, BookOpen, ChevronRight, PlayCircle, FileText, Brain, GraduationCap, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecordedLectures = () => {
  const { classLevel, subjectId, chapterId } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");

  const classes = ["6", "7", "8", "9", "10", "11", "12"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (chapterId) {
        // Fetch lessons for this chapter
        const [lessonsRes, chapterRes] = await Promise.all([
          supabase.from("lessons").select("*").eq("chapter_id", chapterId).order("sort_order"),
          supabase.from("chapters").select("title, title_hi").eq("id", chapterId).single(),
        ]);
        setLessons(lessonsRes.data || []);
        setChapterName(language === "hi" && chapterRes.data?.title_hi ? chapterRes.data.title_hi : chapterRes.data?.title || "");
      } else if (subjectId) {
        // Fetch chapters for this subject
        const [chaptersRes, subjectRes] = await Promise.all([
          supabase.from("chapters").select("*").eq("subject_id", subjectId).order("sort_order"),
          supabase.from("subjects").select("title, title_hi").eq("id", subjectId).single(),
        ]);
        setChapters(chaptersRes.data || []);
        setSubjectName(language === "hi" && subjectRes.data?.title_hi ? subjectRes.data.title_hi : subjectRes.data?.title || "");
      } else if (classLevel) {
        // Fetch courses → subjects for this class
        const { data: courseData } = await supabase
          .from("courses")
          .select("id, title, title_hi")
          .eq("is_published", true)
          .eq("class_level", classLevel)
          .eq("category", "school");

        const courseList = courseData || [];
        setCourses(courseList);

        if (courseList.length > 0) {
          const courseIds = courseList.map((c) => c.id);
          const { data: subjectData } = await supabase
            .from("subjects")
            .select("*, courses!inner(title, title_hi)")
            .in("course_id", courseIds)
            .order("sort_order");
          setSubjects(subjectData || []);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [classLevel, subjectId, chapterId, language]);

  // Class selection screen
  if (!classLevel) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-16 lg:pb-0">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t("recorded.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("recorded.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => navigate(`/dashboard/recorded/${cls}`)}
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

  // Chapter lessons view
  if (chapterId) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-16 lg:pb-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold font-heading text-foreground">{chapterName}</h1>
              <p className="text-sm text-muted-foreground">{t("recorded.chapterContent")}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground">{t("recorded.noLessons")}</h3>
              <p className="text-sm text-muted-foreground">{t("academic.comingSoon")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const typeIcon = lesson.type === "video" ? <PlayCircle className="w-5 h-5 text-primary" /> :
                  lesson.type === "pdf" ? <FileText className="w-5 h-5 text-amber-500" /> :
                  <BookOpen className="w-5 h-5 text-emerald-500" />;
                const typeLabel = lesson.type === "video" ? t("recorded.videoLecture") :
                  lesson.type === "pdf" ? t("recorded.notes") : t("recorded.reading");

                return (
                  <div key={lesson.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {typeIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">
                        {language === "hi" && lesson.title_hi ? lesson.title_hi : lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{typeLabel}</span>
                        {lesson.duration_minutes && <span>{lesson.duration_minutes} min</span>}
                        {lesson.is_free_preview && <span className="text-emerald-500 font-medium">{t("recorded.free")}</span>}
                      </div>
                    </div>
                    {lesson.type === "video" && lesson.video_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(lesson.video_url, "_blank")}>
                        <PlayCircle className="w-3 h-3 mr-1" /> {t("recorded.watch")}
                      </Button>
                    )}
                    {lesson.type === "pdf" && lesson.pdf_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(lesson.pdf_url, "_blank")}>
                        <FileText className="w-3 h-3 mr-1" /> {t("recorded.download")}
                      </Button>
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
  }

  // Subject → Chapters view
  if (subjectId) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-16 lg:pb-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-extrabold font-heading text-foreground">{subjectName}</h1>
              <p className="text-sm text-muted-foreground">{t("recorded.selectChapter")}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground">{t("recorded.noChapters")}</h3>
              <p className="text-sm text-muted-foreground">{t("academic.comingSoon")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/dashboard/recorded/${classLevel}/${subjectId}/${chapter.id}`)}
                  className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {language === "hi" && chapter.title_hi ? chapter.title_hi : chapter.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
        <BottomNav />
      </DashboardLayout>
    );
  }

  // Class level → Subjects view
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/recorded")} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold font-heading text-foreground">{t("shome.class")} {classLevel}</h1>
            <p className="text-sm text-muted-foreground">{t("recorded.selectSubject")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">{t("academic.noContent")}</h3>
            <p className="text-sm text-muted-foreground">{t("academic.comingSoon")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => navigate(`/dashboard/recorded/${classLevel}/${subject.id}`)}
                className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">
                      {language === "hi" && subject.title_hi ? subject.title_hi : subject.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default RecordedLectures;
