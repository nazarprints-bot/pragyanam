import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, BookOpen, Brain, CheckCircle, Award, ArrowRight } from "lucide-react";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const [enrollRes, attRes, certRes] = await Promise.all([
        supabase.from("enrollments").select("*, courses(title, title_hi, id)").eq("user_id", user.id),
        supabase.from("test_attempts").select("*, tests(title)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("certificates").select("*, courses(title)").eq("user_id", user.id),
      ]);
      const enrs = enrollRes.data || [];
      setEnrollments(enrs);
      setAttempts(attRes.data || []);
      setCertificates(certRes.data || []);

      // Fetch lesson-based progress for each course
      const progressMap: Record<string, { completed: number; total: number }> = {};
      for (const enr of enrs) {
        const cid = enr.course_id;
        const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", cid);
        if (!subs || subs.length === 0) { progressMap[cid] = { completed: 0, total: 0 }; continue; }
        const { data: chaps } = await supabase.from("chapters").select("id").in("subject_id", subs.map((s: any) => s.id));
        if (!chaps || chaps.length === 0) { progressMap[cid] = { completed: 0, total: 0 }; continue; }
        const { data: lsns } = await supabase.from("lessons").select("id").in("chapter_id", chaps.map((c: any) => c.id));
        const lessonIds = (lsns || []).map((l: any) => l.id);
        const total = lessonIds.length;
        if (total === 0) { progressMap[cid] = { completed: 0, total: 0 }; continue; }
        const { data: prog } = await supabase
          .from("lesson_progress").select("lesson_id")
          .eq("user_id", user.id).in("lesson_id", lessonIds).eq("is_completed", true);
        progressMap[cid] = { completed: (prog || []).length, total };
      }
      setCourseProgress(progressMap);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const avgScore = attempts.length
    ? (attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">
            Progress / प्रगति
          </h1>
          <p className="text-sm text-muted-foreground">Track your learning journey</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <BookOpen className="w-7 h-7 mx-auto text-primary mb-1" />
                <p className="text-xl font-extrabold text-foreground">{enrollments.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <Brain className="w-7 h-7 mx-auto text-accent-foreground mb-1" />
                <p className="text-xl font-extrabold text-foreground">{attempts.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Tests Taken</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <BarChart3 className="w-7 h-7 mx-auto text-primary mb-1" />
                <p className="text-xl font-extrabold text-foreground">{avgScore}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <Award className="w-7 h-7 mx-auto text-primary mb-1" />
                <p className="text-xl font-extrabold text-foreground">{certificates.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">
                Course Progress / कोर्स प्रगति
              </h2>
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No courses enrolled yet</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enr) => {
                    const cp = courseProgress[enr.course_id] || { completed: 0, total: 0 };
                    const pct = cp.total > 0 ? Math.round((cp.completed / cp.total) * 100) : 0;
                    const hasCert = certificates.some((c: any) => c.course_id === enr.course_id);
                    return (
                      <div
                        key={enr.id}
                        className="p-4 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/dashboard/course/${enr.course_id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-foreground text-sm">{(enr as any).courses?.title}</p>
                          <div className="flex items-center gap-2">
                            {hasCert && <Award className="w-4 h-4 text-primary" />}
                            <span className="text-sm font-bold text-primary">{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar value={pct} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {cp.completed}/{cp.total} lessons completed
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> Certificates / प्रमाणपत्र
                  </h2>
                  <Button size="sm" variant="outline" onClick={() => navigate("/dashboard/certificates")}>
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {certificates.slice(0, 4).map((cert: any) => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <Award className="w-8 h-8 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cert.courses?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Test Results */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">
                Recent Test Results / हाल के टेस्ट
              </h2>
              {attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tests taken yet</p>
              ) : (
                <div className="space-y-3">
                  {attempts.slice(0, 10).map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {(att as any).tests?.title || `Score: ${att.score}/${att.total_marks}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {att.score}/{att.total_marks} marks · {new Date(att.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        (att.percentage || 0) >= 70 ? "text-primary" : (att.percentage || 0) >= 40 ? "text-accent-foreground" : "text-destructive"
                      }`}>
                        {att.percentage?.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Progress;
