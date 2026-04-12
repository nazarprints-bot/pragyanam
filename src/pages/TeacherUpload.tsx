import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BookOpen, Plus, Eye, EyeOff, Trash2, Upload, Image, ArrowLeft, ArrowRight,
  ChevronDown, ChevronRight, FileText, Video, Loader2, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TeacherUpload = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === "hi";

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "", title_hi: "", description: "", description_hi: "",
    category: "school", class_level: "",
  });

  // Content management state
  const [managingCourse, setManagingCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Add forms
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ title: "", title_hi: "" });
  const [addingSubject, setAddingSubject] = useState(false);

  const [addingChapterFor, setAddingChapterFor] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState({ title: "", title_hi: "" });
  const [savingChapter, setSavingChapter] = useState(false);

  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "", title_hi: "", type: "video", video_url: "", duration_minutes: 10, content: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null); // 'video' | 'pdf' | null

  // ===== Course CRUD =====
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const ext = thumbnailFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("course-thumbnails").upload(path, thumbnailFile);
      if (upErr) { toast.error("Thumbnail upload failed"); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
      thumbnailUrl = urlData.publicUrl;
    }
    const { data: newCourse, error } = await supabase.from("courses").insert({
      title: courseForm.title, title_hi: courseForm.title_hi, description: courseForm.description,
      description_hi: courseForm.description_hi, category: courseForm.category,
      class_level: courseForm.class_level || null, is_published: false, created_by: user.id, thumbnail_url: thumbnailUrl,
    }).select().single();
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success(isHi ? "कोर्स बनाया गया!" : "Course created!");
      setCourseForm({ title: "", title_hi: "", description: "", description_hi: "", category: "school", class_level: "" });
      setThumbnailFile(null);
      await fetchMyCourses();
      // Auto-open content management for new course
      if (newCourse) setManagingCourse(newCourse);
    }
    setLoading(false);
  };

  const fetchMyCourses = async () => {
    if (!user) return;
    setLoadingCourses(true);
    const { data } = await supabase.from("courses").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
    setCourses(data || []);
    setLoadingCourses(false);
  };

  const togglePublish = async (course: any) => {
    const { error } = await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    if (error) { toast.error("Failed"); return; }
    toast.success(course.is_published ? (isHi ? "ड्राफ्ट में" : "Moved to draft") : (isHi ? "प्रकाशित!" : "Published!"));
    await fetchMyCourses();
  };

  const deleteCourse = async (courseId: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) { toast.error("Failed"); return; }
    toast.success(isHi ? "कोर्स हटाया गया" : "Course deleted");
    if (managingCourse?.id === courseId) setManagingCourse(null);
    await fetchMyCourses();
  };

  // ===== Content Hierarchy Management =====
  const fetchCourseContent = async (courseId: string) => {
    const { data: subs } = await supabase.from("subjects").select("*").eq("course_id", courseId).order("sort_order");
    if (!subs || subs.length === 0) { setSubjects([]); return; }

    const subIds = subs.map(s => s.id);
    const { data: chaps } = await supabase.from("chapters").select("*").in("subject_id", subIds).order("sort_order");
    const chapIds = (chaps || []).map(c => c.id);
    const { data: lsns } = chapIds.length > 0
      ? await supabase.from("lessons").select("*").in("chapter_id", chapIds).order("sort_order")
      : { data: [] };

    const hierarchy = subs.map((sub: any) => ({
      ...sub,
      chapters: (chaps || []).filter((c: any) => c.subject_id === sub.id).map((ch: any) => ({
        ...ch,
        lessons: (lsns || []).filter((l: any) => l.chapter_id === ch.id),
      })),
    }));
    setSubjects(hierarchy);
  };

  useEffect(() => { if (user) fetchMyCourses(); }, [user]);
  useEffect(() => { if (managingCourse) fetchCourseContent(managingCourse.id); }, [managingCourse?.id]);

  // Add Subject
  const handleAddSubject = async () => {
    if (!managingCourse || !subjectForm.title.trim()) return;
    setAddingSubject(true);
    const { error } = await supabase.from("subjects").insert({
      course_id: managingCourse.id, title: subjectForm.title, title_hi: subjectForm.title_hi || "", sort_order: subjects.length,
    });
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success(isHi ? "विषय जोड़ा गया!" : "Subject added!");
      setSubjectForm({ title: "", title_hi: "" }); setShowSubjectForm(false);
      await fetchCourseContent(managingCourse.id);
    }
    setAddingSubject(false);
  };

  // Add Chapter
  const handleAddChapter = async (subjectId: string) => {
    if (!chapterForm.title.trim()) return;
    setSavingChapter(true);
    const sub = subjects.find(s => s.id === subjectId);
    const { error } = await supabase.from("chapters").insert({
      subject_id: subjectId, title: chapterForm.title, title_hi: chapterForm.title_hi || "",
      sort_order: sub?.chapters?.length || 0,
    });
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success(isHi ? "अध्याय जोड़ा गया!" : "Chapter added!");
      setChapterForm({ title: "", title_hi: "" }); setAddingChapterFor(null);
      await fetchCourseContent(managingCourse.id);
    }
    setSavingChapter(false);
  };

  // Add Lesson (with video + PDF + content)
  // Upload helper with progress tracking via XHR
  const uploadWithProgress = (bucket: string, path: string, file: File, label: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      setUploadingFile(label);
      setUploadProgress(0);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${(supabase as any).auth.session?.()?.access_token || ""}`);
      xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        setUploadingFile(null);
        setUploadProgress(0);
        if (xhr.status >= 200 && xhr.status < 300) resolve(path);
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => { setUploadingFile(null); setUploadProgress(0); reject(new Error("Upload failed")); };
      xhr.send(file);
    });
  };

  const handleAddLesson = async (chapterId: string) => {
    if (!lessonForm.title.trim()) return;
    setSavingLesson(true);

    let finalVideoUrl = lessonForm.video_url || null;
    let finalPdfUrl: string | null = null;

    // Upload video file with progress
    if (videoFile && managingCourse) {
      const ext = videoFile.name.split(".").pop();
      const path = `${managingCourse.id}/${Date.now()}-video.${ext}`;
      try {
        await uploadWithProgress("lesson-files", path, videoFile, "video");
        const { data: urlData } = await supabase.storage.from("lesson-files").createSignedUrl(path, 60 * 60 * 24 * 365);
        finalVideoUrl = urlData?.signedUrl || null;
      } catch {
        toast.error(isHi ? "वीडियो अपलोड विफल" : "Video upload failed");
        setSavingLesson(false);
        return;
      }
    }

    // Upload PDF file with progress
    if (pdfFile && managingCourse) {
      const ext = pdfFile.name.split(".").pop();
      const path = `${managingCourse.id}/${Date.now()}-notes.${ext}`;
      try {
        await uploadWithProgress("lesson-files", path, pdfFile, "pdf");
        const { data: urlData } = await supabase.storage.from("lesson-files").createSignedUrl(path, 60 * 60 * 24 * 365);
        finalPdfUrl = urlData?.signedUrl || null;
      } catch {
        toast.error(isHi ? "PDF अपलोड विफल" : "PDF upload failed");
        setSavingLesson(false);
        return;
      }
    }

    const ch = subjects.flatMap(s => s.chapters).find(c => c.id === chapterId);
    const { error } = await supabase.from("lessons").insert({
      chapter_id: chapterId, title: lessonForm.title, title_hi: lessonForm.title_hi || "",
      type: lessonForm.type, video_url: finalVideoUrl, pdf_url: finalPdfUrl,
      content: lessonForm.content || null,
      duration_minutes: lessonForm.duration_minutes, sort_order: ch?.lessons?.length || 0,
    });
    if (error) toast.error("Failed: " + error.message);
    else {
      toast.success(isHi ? "पाठ जोड़ा गया!" : "Lesson added!");
      setLessonForm({ title: "", title_hi: "", type: "video", video_url: "", duration_minutes: 10, content: "" });
      setVideoFile(null); setPdfFile(null); setAddingLessonFor(null);
      await fetchCourseContent(managingCourse.id);
    }
    setSavingLesson(false);
  };

  // Delete helpers
  const deleteSubject = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    toast.success(isHi ? "विषय हटाया" : "Subject deleted");
    if (managingCourse) await fetchCourseContent(managingCourse.id);
  };
  const deleteChapter = async (id: string) => {
    await supabase.from("chapters").delete().eq("id", id);
    toast.success(isHi ? "अध्याय हटाया" : "Chapter deleted");
    if (managingCourse) await fetchCourseContent(managingCourse.id);
  };
  const deleteLesson = async (id: string) => {
    await supabase.from("lessons").delete().eq("id", id);
    toast.success(isHi ? "पाठ हटाया" : "Lesson deleted");
    if (managingCourse) await fetchCourseContent(managingCourse.id);
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // =========== CONTENT MANAGEMENT VIEW ===========
  if (managingCourse) {
    const totalLessons = subjects.reduce((s, sub) => s + sub.chapters.reduce((c: number, ch: any) => c + ch.lessons.length, 0), 0);
    return (
      <DashboardLayout>
        <div className="space-y-5 max-w-4xl pb-20 lg:pb-0">
          <Button variant="ghost" size="sm" onClick={() => setManagingCourse(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {isHi ? "वापस" : "Back to Courses"}
          </Button>

          {/* Course Info */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                {managingCourse.thumbnail_url ? (
                  <img src={managingCourse.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-navy flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/30" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-extrabold font-heading text-foreground truncate">{managingCourse.title}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium ${managingCourse.is_published ? "text-primary" : "text-muted-foreground"}`}>
                    {managingCourse.is_published ? (isHi ? "प्रकाशित" : "Published") : (isHi ? "ड्राफ्ट" : "Draft")}
                  </span>
                  <span className="text-xs text-muted-foreground">· {totalLessons} {isHi ? "पाठ" : "lessons"}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/course/${managingCourse.id}`)}>
                <Eye className="w-3.5 h-3.5 mr-1" /> {isHi ? "प्रीव्यू" : "Preview"}
              </Button>
            </div>
          </div>

          {/* Subject → Chapter → Lesson Tree */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-heading text-foreground">{isHi ? "कंटेंट प्रबंधन" : "Content Management"}</h2>
              <Button size="sm" onClick={() => setShowSubjectForm(!showSubjectForm)} className="bg-primary text-primary-foreground text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> {isHi ? "विषय जोड़ें" : "Add Subject"}
              </Button>
            </div>

            {/* Add Subject Form */}
            {showSubjectForm && (
              <div className="border border-border rounded-xl p-4 mb-4 space-y-3 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Subject Title</Label><Input required value={subjectForm.title} onChange={e => setSubjectForm({ ...subjectForm, title: e.target.value })} placeholder="e.g. Mathematics" className="mt-1" /></div>
                  <div><Label className="text-xs">{isHi ? "हिंदी शीर्षक" : "Hindi Title"}</Label><Input value={subjectForm.title_hi} onChange={e => setSubjectForm({ ...subjectForm, title_hi: e.target.value })} placeholder="e.g. गणित" className="mt-1" /></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddSubject} disabled={addingSubject} className="bg-primary text-primary-foreground">
                    {addingSubject ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} {isHi ? "जोड़ें" : "Add"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSubjectForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Content Tree */}
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{isHi ? "कोई विषय नहीं। पहला विषय जोड़ें!" : "No subjects yet. Add your first subject!"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map(sub => (
                  <div key={sub.id} className="border border-border rounded-xl overflow-hidden">
                    {/* Subject */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <button onClick={() => toggleSubject(sub.id)} className="flex items-center gap-2 flex-1 text-left">
                        {expandedSubjects.has(sub.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <BookOpen className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-bold text-foreground text-sm">{sub.title}</p>
                          {sub.title_hi && <p className="text-xs text-primary">{sub.title_hi}</p>}
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingChapterFor(sub.id); setExpandedSubjects(prev => new Set(prev).add(sub.id)); }}>
                          <Plus className="w-3 h-3 mr-1" /> {isHi ? "अध्याय" : "Chapter"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteSubject(sub.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {expandedSubjects.has(sub.id) && (
                      <div className="border-t border-border">
                        {/* Add Chapter Form */}
                        {addingChapterFor === sub.id && (
                          <div className="p-3 pl-8 bg-muted/10 border-b border-border space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input size={1} value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="Chapter title" className="text-sm" />
                              <Input size={1} value={chapterForm.title_hi} onChange={e => setChapterForm({ ...chapterForm, title_hi: e.target.value })} placeholder="हिंदी शीर्षक" className="text-sm" />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddChapter(sub.id)} disabled={savingChapter} className="text-xs bg-primary text-primary-foreground">
                                {savingChapter ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Add
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => setAddingChapterFor(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}

                        {sub.chapters.map((ch: any) => (
                          <div key={ch.id}>
                            {/* Chapter */}
                            <div className="flex items-center justify-between p-3 pl-8 border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <button onClick={() => toggleChapter(ch.id)} className="flex items-center gap-2 flex-1 text-left">
                                {expandedChapters.has(ch.id) ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{ch.title}</p>
                                  {ch.title_hi && <p className="text-xs text-muted-foreground">{ch.title_hi}</p>}
                                </div>
                              </button>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground mr-1">{ch.lessons.length} {isHi ? "पाठ" : "lessons"}</span>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingLessonFor(ch.id); setExpandedChapters(prev => new Set(prev).add(ch.id)); }}>
                                  <Plus className="w-3 h-3 mr-1" /> {isHi ? "पाठ" : "Lesson"}
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteChapter(ch.id)}>
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {expandedChapters.has(ch.id) && (
                              <div className="bg-background">
                                {/* Add Lesson Form */}
                                {addingLessonFor === ch.id && (
                                  <div className="p-3 pl-12 bg-muted/10 border-b border-border space-y-3">
                                    <p className="text-xs font-semibold text-foreground">{isHi ? "नया पाठ जोड़ें" : "Add New Lesson"}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input size={1} value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="text-sm" />
                                      <Input size={1} value={lessonForm.title_hi} onChange={e => setLessonForm({ ...lessonForm, title_hi: e.target.value })} placeholder="हिंदी शीर्षक" className="text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs flex items-center gap-1"><Video className="w-3 h-3" /> Video URL</Label>
                                        <Input size={1} value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="YouTube URL" className="mt-1 text-sm" />
                                      </div>
                                      <div>
                                        <Label className="text-xs flex items-center gap-1"><Upload className="w-3 h-3" /> {isHi ? "वीडियो अपलोड" : "Upload Video"}</Label>
                                        <Input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="mt-1 text-sm" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> {isHi ? "नोट्स PDF अपलोड" : "Upload Notes (PDF)"}</Label>
                                        <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="mt-1 text-sm" />
                                      </div>
                                      <div>
                                        <Label className="text-xs">{isHi ? "अवधि (मिनट)" : "Duration (min)"}</Label>
                                        <Input type="number" min={1} value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })} className="mt-1 text-sm w-24" />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs">{isHi ? "टेक्स्ट नोट्स (वैकल्पिक)" : "Text Notes (optional)"}</Label>
                                      <Textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder={isHi ? "पाठ के नोट्स..." : "Lesson notes..."} className="mt-1 text-sm min-h-[60px]" />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleAddLesson(ch.id)} disabled={savingLesson} className="text-xs bg-primary text-primary-foreground">
                                        {savingLesson ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {isHi ? "सेव हो रहा..." : "Saving..."}</> : <><Upload className="w-3 h-3 mr-1" /> {isHi ? "पाठ जोड़ें" : "Add Lesson"}</>}
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setAddingLessonFor(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                )}

                                {/* Lesson List */}
                                {ch.lessons.length === 0 && addingLessonFor !== ch.id && (
                                  <p className="text-xs text-muted-foreground text-center py-3 pl-12">{isHi ? "कोई पाठ नहीं" : "No lessons yet"}</p>
                                )}
                                {ch.lessons.map((lesson: any, idx: number) => (
                                  <div key={lesson.id} className="flex items-center gap-3 p-2.5 pl-12 border-b border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{idx + 1}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-foreground text-sm truncate">{lesson.title}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {lesson.video_url && <span className="text-[10px] text-primary flex items-center gap-0.5"><Video className="w-2.5 h-2.5" /> Video</span>}
                                        {lesson.pdf_url && <span className="text-[10px] text-primary flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" /> PDF</span>}
                                        {lesson.duration_minutes && <span className="text-[10px] text-muted-foreground">{lesson.duration_minutes}m</span>}
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => deleteLesson(lesson.id)}>
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {sub.chapters.length === 0 && addingChapterFor !== sub.id && (
                          <p className="text-xs text-muted-foreground text-center py-3 pl-8">{isHi ? "कोई अध्याय नहीं" : "No chapters yet"}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/dashboard/course/${managingCourse.id}`)}>
              <Eye className="w-4 h-4 mr-1" /> {isHi ? "छात्र व्यू देखें" : "Preview as Student"}
            </Button>
            <Button onClick={() => togglePublish(managingCourse)} className="bg-primary text-primary-foreground">
              {managingCourse.is_published ? (
                <><EyeOff className="w-4 h-4 mr-1" /> {isHi ? "ड्राफ्ट में रखें" : "Unpublish"}</>
              ) : (
                <><Eye className="w-4 h-4 mr-1" /> {isHi ? "प्रकाशित करें" : "Publish Course"}</>
              )}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =========== MAIN: CREATE + LIST COURSES ===========
  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl pb-20 lg:pb-0">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">{isHi ? "कंटेंट अपलोड" : "Upload Content"}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? "कोर्स बनाएँ और study material अपलोड करें" : "Create courses and upload study material"}</p>
        </div>

        {/* Create Course Form */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> {isHi ? "नया कोर्स बनाएँ" : "Create New Course"}
          </h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Title</Label><Input required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Mathematics Class 10" className="mt-1" /></div>
              <div><Label>{isHi ? "हिंदी शीर्षक" : "Hindi Title"}</Label><Input value={courseForm.title_hi} onChange={e => setCourseForm({ ...courseForm, title_hi: e.target.value })} placeholder="गणित कक्षा 10" className="mt-1" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description" className="mt-1" /></div>
            <div><Label>{isHi ? "हिंदी विवरण" : "Hindi Description"}</Label><Textarea value={courseForm.description_hi} onChange={e => setCourseForm({ ...courseForm, description_hi: e.target.value })} className="mt-1" /></div>
            <div>
              <Label className="flex items-center gap-1"><Image className="w-4 h-4" /> {isHi ? "कोर्स फोटो" : "Course Photo"}</Label>
              <Input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} className="mt-1" />
              {thumbnailFile && (
                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="school">School</option><option value="competitive">Competitive</option><option value="scholarship">Scholarship</option>
                </select>
              </div>
              <div><Label>Class Level</Label><Input value={courseForm.class_level} onChange={e => setCourseForm({ ...courseForm, class_level: e.target.value })} placeholder="e.g. 10" className="mt-1" /></div>
            </div>
            <Button type="submit" disabled={loading} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
              {loading ? (isHi ? "बन रहा है..." : "Creating...") : (isHi ? "कोर्स बनाएँ" : "Create Course")}
            </Button>
          </form>
        </div>

        {/* My Courses */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> {isHi ? "मेरे कोर्सेज़" : "My Courses"}
          </h2>
          {loadingCourses ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">{isHi ? "अभी कोई कोर्स नहीं" : "No courses yet"}</p>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className="border border-border rounded-xl p-3 sm:p-4 flex flex-col gap-3 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full gradient-navy flex items-center justify-center"><BookOpen className="w-4 h-4 text-white/30" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.is_published ? (isHi ? "प्रकाशित" : "Published") : (isHi ? "ड्राफ्ट" : "Draft")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setManagingCourse(course)}>
                      <BookOpen className="w-3.5 h-3.5 mr-1" /> {isHi ? "कंटेंट प्रबंधन" : "Manage Content"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => navigate(`/dashboard/course/${course.id}`)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> {isHi ? "प्रीव्यू" : "Preview"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => togglePublish(course)}>
                      {course.is_published ? <><EyeOff className="w-3.5 h-3.5 mr-1" /> Unpublish</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Publish</>}
                    </Button>
                    <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => deleteCourse(course.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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

export default TeacherUpload;