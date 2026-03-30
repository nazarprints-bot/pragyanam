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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

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

  const fetchCourse = async () => {
    if (!courseId) return;
    const { data } = await supabase.from("courses").select("*").eq("id", courseId).single();
    if (data) {
      setCourse(data);
      // Fetch teacher profile
      if (data.created_by) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", data.created_by).single();
        setTeacher(prof);
      }
    }
  };

  const fetchLessons = async () => {
    if (!courseId) return;
    // Lessons directly linked to course via chapter → we use a simplified approach
    // Since user wants Course → Lessons directly, we'll query lessons via a "virtual" chapter
    // First check if course has a default chapter, if not create one for teachers
    const { data: subjects } = await supabase.from("subjects").select("id").eq("course_id", courseId).limit(1);
    if (!subjects || subjects.length === 0) {
      if (canManage) {
        // Auto-create default subject and chapter
        const { data: subj } = await supabase.from("subjects").insert({
          course_id: courseId, title: "Main", title_hi: "मुख्य", sort_order: 0,
        }).select("id").single();
        if (subj) {
          await supabase.from("chapters").insert({
            subject_id: subj.id, title: "Lessons", title_hi: "पाठ", sort_order: 0,
          });
        }
      }
    }

    // Get all lessons for this course through subjects → chapters → lessons
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId);
    if (!subs || subs.length === 0) { setLessons([]); return; }
    const subIds = subs.map(s => s.id);
    const { data: chaps } = await supabase.from("chapters").select("id").in("subject_id", subIds);
    if (!chaps || chaps.length === 0) { setLessons([]); return; }
    const chapIds = chaps.map(c => c.id);
    const { data: lsns } = await supabase.from("lessons").select("*").in("chapter_id", chapIds).order("sort_order");
    setLessons(lsns || []);
  };

  const fetchLiveClasses = async () => {
    if (!courseId) return;
    const { data } = await supabase
      .from("live_classes")
      .select("*")
      .eq("course_id", courseId)
      .in("status", ["scheduled", "live"])
      .order("scheduled_at");
    setLiveClasses(data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCourse(), fetchLessons(), fetchLiveClasses()]);
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setUploading(true);

    // Get the default chapter
    const { data: subs } = await supabase.from("subjects").select("id").eq("course_id", courseId).limit(1);
    if (!subs || subs.length === 0) { toast.error("No subject found"); setUploading(false); return; }
    const { data: chaps } = await supabase.from("chapters").select("id").eq("subject_id", subs[0].id).limit(1);
    if (!chaps || chaps.length === 0) { toast.error("No chapter found"); setUploading(false); return; }

    let finalVideoUrl = lessonForm.video_url;

    // Upload video file if provided
    if (videoFile) {
      const ext = videoFile.name.split(".").pop();
      const path = `${courseId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("lesson-files").upload(path, videoFile);
      if (uploadErr) {
        toast.error("Video upload failed: " + uploadErr.message);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("lesson-files").getPublicUrl(path);
      finalVideoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("lessons").insert({
      chapter_id: chaps[0].id,
      title: lessonForm.title,
      title_hi: lessonForm.title_hi || "",
      type: lessonForm.type,
      video_url: finalVideoUrl || null,
      duration_minutes: lessonForm.duration_minutes,
      sort_order: lessons.length,
    });

    if (error) {
      toast.error("Failed to add lesson: " + error.message);
    } else {
      toast.success("Lesson added! / पाठ जोड़ा गया!");
      setLessonForm({ title: "", title_hi: "", type: "video", video_url: "", duration_minutes: 10 });
      setVideoFile(null);
      setShowLessonForm(false);
      await fetchLessons();
    }
    setUploading(false);
  };

  const deleteLesson = async (lessonId: string) => {
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) toast.error("Delete failed: " + error.message);
    else { toast.success("Lesson deleted"); await fetchLessons(); }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Direct URL (uploaded file)
    return url;
  };

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

  // Active video room
  if (activeRoom) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <Video className="w-5 h-5 text-destructive animate-pulse" /> Live Class
            </h1>
            <Button variant="outline" onClick={() => setActiveRoom(null)}>
              Leave / छोड़ें
            </Button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border" style={{ height: "calc(100vh - 200px)" }}>
            <iframe
              src={`https://meet.jit.si/pragyanam-${activeRoom}#config.prejoinConfig.enabled=false`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full"
              title="Live Class"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Back button */}
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
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                {course.category}
              </span>
              {course.class_level && (
                <span className="text-xs text-muted-foreground">Class {course.class_level}</span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{course.title}</h1>
            <p className="text-primary font-medium">{course.title_hi}</p>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
            )}

            {/* Teacher Info */}
            {teacher && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.full_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    teacher.full_name?.charAt(0)?.toUpperCase() || "T"
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{teacher.full_name || "Teacher"}</p>
                  <p className="text-xs text-muted-foreground">Instructor / शिक्षक</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Classes for this course */}
        {liveClasses.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-destructive" />
              Live Classes / लाइव क्लास
            </h2>
            <div className="space-y-3">
              {liveClasses.map((lc) => (
                <div key={lc.id} className="flex items-center justify-between border border-border rounded-xl p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {lc.status === "live" && (
                        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                      )}
                      <p className="font-semibold text-foreground">{lc.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lc.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {" · "}
                      <Clock className="w-3 h-3" />
                      {new Date(lc.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {lc.status === "live" ? (
                    <Button size="sm" className="gradient-saffron border-0 text-primary-foreground" onClick={() => setActiveRoom(lc.room_id)}>
                      <Play className="w-3 h-3 mr-1" /> Join
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Upcoming</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons Section */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Lessons / पाठ ({lessons.length})
            </h2>
            {canManage && (
              <Button size="sm" onClick={() => setShowLessonForm(!showLessonForm)} className="gradient-saffron border-0 text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> Add Lesson
              </Button>
            )}
          </div>

          {/* Add Lesson Form */}
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

          {/* Active Video Player */}
          {activeVideo && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border bg-black aspect-video">
              {activeVideo.includes("youtube.com") || activeVideo.includes("youtu.be") ? (
                <iframe src={getEmbedUrl(activeVideo)!} className="w-full h-full" allowFullScreen title="Video" />
              ) : (
                <video src={activeVideo} controls className="w-full h-full" />
              )}
            </div>
          )}

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No lessons yet / अभी कोई पाठ नहीं
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    activeVideo === lesson.video_url
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => lesson.video_url && setActiveVideo(lesson.video_url)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{lesson.title}</p>
                    {lesson.title_hi && <p className="text-xs text-primary truncate">{lesson.title_hi}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lesson.duration_minutes && (
                      <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
                    )}
                    {lesson.video_url ? (
                      <Video className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    )}
                    {canManage && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
