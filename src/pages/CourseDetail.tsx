import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BookOpen, Play, Plus, Trash2, Video, FileText, Link as LinkIcon,
  Upload, Clock, Calendar, ArrowLeft, Users, Loader2, GripVertical, CheckCircle,
  Award, ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseTests, setCourseTests] = useState<any[]>([]);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [bestTestScore, setBestTestScore] = useState<number | null>(null);

  // Teacher lesson form
  const isTeacherOrAdmin = role === "teacher" || role === "admin";
  const isOwner = course?.created_by === user?.id;
  const canManage = isTeacherOrAdmin && isOwner;
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "", title_hi: "", type: "video", video_url: "", duration_minutes: 10,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Live class scheduling
  const [showLiveForm, setShowLiveForm] = useState(false);
  const [liveForm, setLiveForm] = useState({ title: "", title_hi: "", scheduled_at: "", duration_minutes: 60 });
  const [liveThumbnail, setLiveThumbnail] = useState<File | null>(null);
  const [schedulingLive, setSchedulingLive] = useState(false);

  const fetchCourse = async () => {
    if (!courseId) return;
    const { data } = await supabase.from("courses").select("*").eq("id", courseId).single();
    if (data) {
      setCourse(data);
      if (data.created_by) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", data.created_by).single();
        setTeacher(prof);
      }
    }
  };

  const fetchLessons = async () => {
    if (!courseId) return;
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId);
    if (!subs || subs.length === 0) {
      if (canManage) {
        const { data: subj } = await supabase.from("subjects").insert({
          course_id: courseId, title: "Main", title_hi: "मुख्य", sort_order: 0,
        }).select("id").single();
        if (subj) {
          await supabase.from("chapters").insert({
            subject_id: subj.id, title: "Lessons", title_hi: "पाठ", sort_order: 0,
          });
        }
      }
      setLessons([]);
      return;
    }
    const subIds = subs.map(s => s.id);
    const { data: chaps } = await supabase.from("chapters").select("id").in("subject_id", subIds);
    if (!chaps || chaps.length === 0) { setLessons([]); return; }
    const chapIds = chaps.map(c => c.id);
    const { data: lsns } = await supabase.from("lessons").select("*").in("chapter_id", chapIds).order("sort_order");
    setLessons(lsns || []);
  };

  const fetchLessonProgress = async () => {
    if (!courseId || !user) return;
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId);
    if (!subs || subs.length === 0) return;
    const { data: chaps } = await supabase.from("chapters").select("id").in("subject_id", subs.map(s => s.id));
    if (!chaps || chaps.length === 0) return;
    const { data: lsns } = await supabase.from("lessons").select("id").in("chapter_id", chaps.map(c => c.id));
    if (!lsns || lsns.length === 0) return;
    const { data: prog } = await supabase
      .from("lesson_progress").select("lesson_id, is_completed")
      .eq("user_id", user.id).in("lesson_id", lsns.map(l => l.id));
    const map: Record<string, boolean> = {};
    (prog || []).forEach(p => { if (p.is_completed) map[p.lesson_id] = true; });
    setLessonProgress(map);
  };

  const fetchEnrollment = async () => {
    if (!courseId || !user) return;
    const { data } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).limit(1);
    setIsEnrolled((data || []).length > 0);
  };

  const fetchCourseTests = async () => {
    if (!courseId) return;
    const { data } = await supabase.from("tests").select("*").eq("course_id", courseId).eq("is_published", true);
    setCourseTests(data || []);

    // Check if student passed any course test (>=40%)
    if (user && data && data.length > 0) {
      const testIds = data.map((t: any) => t.id);
      const { data: attempts } = await supabase
        .from("test_attempts").select("percentage, test_id")
        .eq("user_id", user.id).in("test_id", testIds);
      if (attempts && attempts.length > 0) {
        const best = Math.max(...attempts.map((a: any) => a.percentage || 0));
        setBestTestScore(best);
        setTestPassed(best >= 40);
      }
    }
  };

  const fetchCertificate = async () => {
    if (!courseId || !user) return;
    const { data } = await supabase.from("certificates").select("id").eq("user_id", user.id).eq("course_id", courseId).limit(1);
    setHasCertificate((data || []).length > 0);
  };

  const fetchLiveClasses = async () => {
    if (!courseId) return;
    const { data } = await supabase
      .from("live_classes").select("*").eq("course_id", courseId)
      .in("status", ["scheduled", "live"]).order("scheduled_at");
    setLiveClasses(data || []);
  };

  const fetchEnrolledStudents = async () => {
    if (!courseId) return;
    const { data: enrollments } = await supabase
      .from("enrollments").select("user_id, enrolled_at, progress").eq("course_id", courseId);
    if (!enrollments || enrollments.length === 0) { setEnrolledStudents([]); return; }
    const userIds = enrollments.map(e => e.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId);
    let lessonIds: string[] = [];
    if (subs && subs.length > 0) {
      const { data: chaps } = await supabase.from("chapters").select("id").in("subject_id", subs.map(s => s.id));
      if (chaps && chaps.length > 0) {
        const { data: lsns } = await supabase.from("lessons").select("id").in("chapter_id", chaps.map(c => c.id));
        lessonIds = (lsns || []).map(l => l.id);
      }
    }
    const totalLessons = lessonIds.length;
    let progressMap: Record<string, number> = {};
    if (totalLessons > 0 && userIds.length > 0) {
      const { data: lp } = await supabase
        .from("lesson_progress").select("user_id, lesson_id, is_completed")
        .in("user_id", userIds).in("lesson_id", lessonIds).eq("is_completed", true);
      (lp || []).forEach(p => { progressMap[p.user_id] = (progressMap[p.user_id] || 0) + 1; });
    }
    const profileMap: Record<string, any> = {};
    (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
    setEnrolledStudents(enrollments.map(e => ({
      ...e,
      profile: profileMap[e.user_id] || { full_name: "Student", avatar_url: null },
      completedLessons: progressMap[e.user_id] || 0,
      totalLessons,
      percentage: totalLessons > 0 ? Math.round(((progressMap[e.user_id] || 0) / totalLessons) * 100) : 0,
    })));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchCourse(), fetchLessons(), fetchLiveClasses(),
        fetchEnrolledStudents(), fetchLessonProgress(),
        fetchEnrollment(), fetchCourseTests(), fetchCertificate(),
      ]);
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  // Mark lesson as completed
  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;
    // Upsert lesson progress
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: lessonId, is_completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );
    if (error) {
      // Try insert if upsert fails
      await supabase.from("lesson_progress").insert({
        user_id: user.id, lesson_id: lessonId, is_completed: true, completed_at: new Date().toISOString(),
      });
    }
    setLessonProgress(prev => ({ ...prev, [lessonId]: true }));
    toast.success("Lesson completed! ✓");

    // Update enrollment progress
    const completedCount = Object.values({ ...lessonProgress, [lessonId]: true }).filter(Boolean).length;
    const totalCount = lessons.length;
    if (totalCount > 0 && courseId) {
      const pct = Math.round((completedCount / totalCount) * 100);
      await supabase.from("enrollments")
        .update({ progress: pct })
        .eq("user_id", user.id).eq("course_id", courseId);
    }

    // Check if all lessons complete → offer certificate
    if (completedCount === totalCount && totalCount > 0) {
      checkAndIssueCertificate();
    }
  };

  const checkAndIssueCertificate = async () => {
    if (!user || !courseId || hasCertificate) return;
    // Check all lessons completed
    const allDone = lessons.every(l => lessonProgress[l.id]);
    if (!allDone) {
      toast.error("Please complete all lessons first! / पहले सभी पाठ पूरे करें!");
      return;
    }
    // Check test passed (if course has tests)
    if (courseTests.length > 0 && !testPassed) {
      toast.error("Please pass the course test first (40% minimum)! / पहले कोर्स टेस्ट पास करें!");
      return;
    }

    const { error } = await supabase.from("certificates").insert({
      user_id: user.id, course_id: courseId,
    });
    if (!error) {
      setHasCertificate(true);
      toast.success("🎉 Congratulations! Certificate earned! / बधाई हो! प्रमाणपत्र प्राप्त हुआ!");
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setUploading(true);
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId).limit(1);
    if (!subs || subs.length === 0) { toast.error("No subject found"); setUploading(false); return; }
    const { data: chaps } = await supabase.from("chapters").select("id").eq("subject_id", subs[0].id).limit(1);
    if (!chaps || chaps.length === 0) { toast.error("No chapter found"); setUploading(false); return; }
    let finalVideoUrl = lessonForm.video_url;
    if (videoFile) {
      const ext = videoFile.name.split(".").pop();
      const path = `${courseId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("lesson-files").upload(path, videoFile);
      if (uploadErr) { toast.error("Video upload failed: " + uploadErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("lesson-files").getPublicUrl(path);
      finalVideoUrl = urlData.publicUrl;
    }
    const { error } = await supabase.from("lessons").insert({
      chapter_id: chaps[0].id, title: lessonForm.title, title_hi: lessonForm.title_hi || "",
      type: lessonForm.type, video_url: finalVideoUrl || null,
      duration_minutes: lessonForm.duration_minutes, sort_order: lessons.length,
    });
    if (error) toast.error("Failed to add lesson: " + error.message);
    else {
      toast.success("Lesson added! / पाठ जोड़ा गया!");
      setLessonForm({ title: "", title_hi: "", type: "video", video_url: "", duration_minutes: 10 });
      setVideoFile(null); setShowLessonForm(false); await fetchLessons();
    }
    setUploading(false);
  };

  const deleteLesson = async (lessonId: string) => {
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) toast.error("Delete failed: " + error.message);
    else { toast.success("Lesson deleted"); await fetchLessons(); }
  };

  const handleScheduleLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !user) return;
    setSchedulingLive(true);
    let thumbnailUrl: string | null = null;
    if (liveThumbnail) {
      const ext = liveThumbnail.name.split(".").pop();
      const path = `live-class-thumbnails/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("course-thumbnails").upload(path, liveThumbnail);
      if (!upErr) { const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path); thumbnailUrl = data.publicUrl; }
    }
    const { error } = await supabase.from("live_classes").insert({
      title: liveForm.title, title_hi: liveForm.title_hi || "", course_id: courseId,
      teacher_id: user.id, scheduled_at: new Date(liveForm.scheduled_at).toISOString(),
      duration_minutes: liveForm.duration_minutes, status: "scheduled",
      thumbnail_url: thumbnailUrl, max_students: 75,
    } as any);
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success("Live class scheduled! / लाइव क्लास शेड्यूल हुई!");
      setLiveForm({ title: "", title_hi: "", scheduled_at: "", duration_minutes: 60 });
      setLiveThumbnail(null); setShowLiveForm(false); await fetchLiveClasses();
    }
    setSchedulingLive(false);
  };

  const handleDeleteLiveClass = async (classId: string) => {
    const { error } = await supabase.from("live_classes").delete().eq("id", classId);
    if (error) toast.error("Failed: " + error.message);
    else { toast.success("Class removed"); await fetchLiveClasses(); }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const completedCount = Object.values(lessonProgress).filter(Boolean).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Course not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (activeRoom) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <Video className="w-5 h-5 text-destructive animate-pulse" /> Live Class
            </h1>
            <Button variant="outline" onClick={() => setActiveRoom(null)}>Leave / छोड़ें</Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border" style={{ height: "calc(100vh - 200px)" }}>
            <iframe
              src={`https://meet.jit.si/pragyanam-${activeRoom}#config.prejoinConfig.enabled=false`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full" title="Live Class"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back / वापस
        </Button>

        {/* Course Header */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative h-48 sm:h-56">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-hero flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-primary-foreground/30" />
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{course.category}</span>
              {course.class_level && <span className="text-xs text-muted-foreground">Class {course.class_level}</span>}
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{course.title}</h1>
            <p className="text-primary font-medium">{course.title_hi}</p>
            {course.description && <p className="text-sm text-muted-foreground mt-2">{course.description}</p>}

            {teacher && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.full_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{teacher.full_name || "Teacher"}</p>
                  <p className="text-xs text-muted-foreground">Instructor / शिक्षक</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (Student only) */}
        {isEnrolled && role === "student" && lessons.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground text-sm">Course Progress / कोर्स प्रगति</h3>
              <span className="text-sm font-bold text-primary">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount}/{lessons.length} lessons completed
              {courseTests.length > 0 && (
                <span className={`ml-2 ${testPassed ? "text-primary" : "text-destructive"}`}>
                  · Test: {testPassed ? `Passed (${bestTestScore?.toFixed(0)}%)` : bestTestScore !== null ? `Failed (${bestTestScore?.toFixed(0)}%)` : "Not attempted"}
                </span>
              )}
            </p>

            {/* Checklist for certificate */}
            {!hasCertificate && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Certificate Requirements / प्रमाणपत्र आवश्यकताएं:</p>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`w-4 h-4 ${progressPct === 100 ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={progressPct === 100 ? "text-foreground" : "text-muted-foreground"}>
                    Complete all lessons / सभी पाठ पूरे करें
                  </span>
                </div>
                {courseTests.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className={`w-4 h-4 ${testPassed ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={testPassed ? "text-foreground" : "text-muted-foreground"}>
                      Pass course test (40% min) / कोर्स टेस्ट पास करें
                    </span>
                  </div>
                )}
              </div>
            )}

            {hasCertificate && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Certificate Earned! / प्रमाणपत्र प्राप्त!</span>
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("/dashboard/certificates")}>
                  View <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
            {progressPct === 100 && (courseTests.length === 0 || testPassed) && !hasCertificate && (
              <Button
                size="sm" className="mt-3 bg-primary text-primary-foreground"
                onClick={checkAndIssueCertificate}
              >
                <Award className="w-4 h-4 mr-1" /> Claim Certificate / प्रमाणपत्र लें
              </Button>
            )}
          </div>
        )}

        {/* Live Classes */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Video className="w-5 h-5 text-destructive" /> Live Classes / लाइव क्लास
            </h2>
            {canManage && (
              <Button size="sm" onClick={() => setShowLiveForm(!showLiveForm)} className="gradient-saffron border-0 text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Schedule Live
              </Button>
            )}
          </div>

          {showLiveForm && canManage && (
            <form onSubmit={handleScheduleLive} className="border border-border rounded-xl p-4 mb-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input required value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="e.g. Trigonometry Revision" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Subtitle (Hindi)</Label>
                  <Input value={liveForm.title_hi} onChange={(e) => setLiveForm({ ...liveForm, title_hi: e.target.value })} placeholder="Optional" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Date & Time</Label>
                  <Input type="datetime-local" required value={liveForm.scheduled_at} onChange={(e) => setLiveForm({ ...liveForm, scheduled_at: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Duration (min)</Label>
                  <Input type="number" min={15} max={180} value={liveForm.duration_minutes} onChange={(e) => setLiveForm({ ...liveForm, duration_minutes: Number(e.target.value) })} className="mt-1 w-32" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Thumbnail (Optional)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setLiveThumbnail(e.target.files?.[0] || null)} className="mt-1" />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Max 75 students per class</p>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={schedulingLive} className="gradient-saffron border-0 text-primary-foreground">
                  {schedulingLive ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Scheduling...</> : <><Calendar className="w-3 h-3 mr-1" /> Schedule</>}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowLiveForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {liveClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No live classes scheduled / कोई लाइव क्लास नहीं</p>
          ) : (
            <div className="space-y-3">
              {liveClasses.map((lc) => (
                <div key={lc.id} className="flex items-center justify-between border border-border rounded-xl p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {lc.status === "live" && <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                      <p className="font-semibold text-foreground">{lc.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lc.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" · "}<Clock className="w-3 h-3" />
                      {new Date(lc.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}<Users className="w-3 h-3" />{lc.current_students || 0}/{lc.max_students || 75}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lc.status === "live" ? (
                      <Button size="sm" className="gradient-saffron border-0 text-primary-foreground" onClick={() => setActiveRoom(lc.room_id)}>
                        <Play className="w-3 h-3 mr-1" /> Join
                      </Button>
                    ) : <span className="text-xs text-muted-foreground">Upcoming</span>}
                    {canManage && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteLiveClass(lc.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lessons Section */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> Lessons / पाठ ({lessons.length})
            </h2>
            {canManage && (
              <Button size="sm" onClick={() => setShowLessonForm(!showLessonForm)} className="gradient-saffron border-0 text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Lesson
              </Button>
            )}
          </div>

          {showLessonForm && canManage && (
            <form onSubmit={handleAddLesson} className="border border-border rounded-xl p-4 mb-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title (English)</Label>
                  <Input required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Title (Hindi)</Label>
                  <Input value={lessonForm.title_hi} onChange={(e) => setLessonForm({ ...lessonForm, title_hi: e.target.value })} placeholder="पाठ शीर्षक" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Video URL (YouTube/Link)</Label>
                  <Input value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Or Upload Video File</Label>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Duration (minutes)</Label>
                <Input type="number" min={1} value={lessonForm.duration_minutes} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })} className="mt-1 w-32" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={uploading} className="gradient-saffron border-0 text-primary-foreground">
                  {uploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</> : <><Upload className="w-3 h-3 mr-1" /> Add Lesson</>}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowLessonForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {activeVideo && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border bg-black aspect-video">
              {activeVideo.includes("youtube.com") || activeVideo.includes("youtu.be") ? (
                <iframe src={getEmbedUrl(activeVideo)!} className="w-full h-full" allowFullScreen title="Video" />
              ) : (
                <video src={activeVideo} controls className="w-full h-full" />
              )}
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No lessons yet / अभी कोई पाठ नहीं</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isCompleted = lessonProgress[lesson.id];
                const isActive = activeVideo === lesson.video_url;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      isActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (lesson.video_url) {
                        setActiveVideo(lesson.video_url);
                        setActiveLessonId(lesson.id);
                      }
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCompleted ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {lesson.title}
                      </p>
                      {lesson.title_hi && <p className="text-xs text-primary truncate">{lesson.title_hi}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lesson.duration_minutes && <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>}
                      {!isCompleted && isEnrolled && role === "student" && (
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 text-xs text-primary"
                          onClick={(e) => { e.stopPropagation(); markLessonComplete(lesson.id); }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Done
                        </Button>
                      )}
                      {lesson.video_url ? <Video className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                      {canManage && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Tests */}
        {courseTests.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              📝 Course Tests / कोर्स टेस्ट
            </h2>
            <div className="space-y-2">
              {courseTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{test.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {test.duration_minutes} min · {test.total_marks} marks
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/dashboard/tests")} className="bg-primary text-primary-foreground">
                    Take Test <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enrolled Students - Teacher Only */}
        {canManage && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Enrolled Students / नामांकित छात्र ({enrolledStudents.length})
            </h2>
            {enrolledStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No students enrolled yet / अभी कोई छात्र नामांकित नहीं</p>
            ) : (
              <div className="space-y-3">
                {enrolledStudents.map((s) => (
                  <div key={s.user_id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {s.profile.avatar_url ? (
                        <img src={s.profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : s.profile.full_name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{s.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Enrolled {new Date(s.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 min-w-[140px]">
                      <Progress value={s.percentage} className="h-2 flex-1" />
                      <span className="text-xs font-semibold text-foreground w-10 text-right">{s.percentage}%</span>
                      {s.percentage === 100 && <CheckCircle className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
