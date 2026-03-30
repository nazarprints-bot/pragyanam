import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Plus, Eye, EyeOff, Trash2, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TeacherUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "", title_hi: "", description: "", description_hi: "",
    category: "school", class_level: "",
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let thumbnailUrl: string | null = null;

    if (thumbnailFile) {
      const ext = thumbnailFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("course-thumbnails").upload(path, thumbnailFile);
      if (upErr) {
        toast.error("Thumbnail upload failed: " + upErr.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
      thumbnailUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("courses").insert({
      title: courseForm.title,
      title_hi: courseForm.title_hi,
      description: courseForm.description,
      description_hi: courseForm.description_hi,
      category: courseForm.category,
      class_level: courseForm.class_level || null,
      is_published: false,
      created_by: user.id,
      thumbnail_url: thumbnailUrl,
    });
    if (error) {
      toast.error("Failed to create course: " + error.message);
    } else {
      toast.success("Course created!");
      setCourseForm({ title: "", title_hi: "", description: "", description_hi: "", category: "school", class_level: "" });
      setThumbnailFile(null);
      await fetchMyCourses();
    }
    setLoading(false);
  };

  const fetchMyCourses = async () => {
    if (!user) return;
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from("courses").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
    if (error) toast.error("Failed to load courses: " + error.message);
    else setCourses(data || []);
    setLoadingCourses(false);
  };

  const togglePublish = async (course: any) => {
    const { error } = await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success(course.is_published ? "Moved to draft" : "Published");
    await fetchMyCourses();
  };

  const deleteCourse = async (courseId: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success("Course deleted");
    await fetchMyCourses();
  };

  useEffect(() => { if (user) fetchMyCourses(); }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">Upload Content</h1>
          <p className="text-sm text-muted-foreground">Create courses and upload study material</p>
        </div>

        {/* Create Course Form */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold" /> Create New Course
          </h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Mathematics Class 10" className="mt-1" />
              </div>
              <div>
                <Label>Subtitle (Optional)</Label>
                <Input value={courseForm.title_hi} onChange={(e) => setCourseForm({ ...courseForm, title_hi: e.target.value })} placeholder="Optional subtitle" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description" className="mt-1" />
            </div>
            <div>
              <Label>Additional Description (Optional)</Label>
              <Textarea value={courseForm.description_hi} onChange={(e) => setCourseForm({ ...courseForm, description_hi: e.target.value })} placeholder="Additional details" className="mt-1" />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <Label className="flex items-center gap-1"><Image className="w-4 h-4" /> Course Photo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="mt-1" />
              {thumbnailFile && (
                <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="school">School</option>
                  <option value="competitive">Competitive</option>
                  <option value="scholarship">Scholarship</option>
                </select>
              </div>
              <div>
                <Label>Class Level</Label>
                <Input value={courseForm.class_level} onChange={(e) => setCourseForm({ ...courseForm, class_level: e.target.value })} placeholder="e.g. 10" className="mt-1" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </form>
        </div>

        {/* My Courses */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" /> My Courses
          </h2>
          {loadingCourses ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-7 h-7 border-4 border-gold border-t-transparent rounded-full" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-gold/20 transition-colors">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-navy flex items-center justify-center"><BookOpen className="w-5 h-5 text-white/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/course/${course.id}`)}>
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => togglePublish(course)}>
                      {course.is_published ? <><EyeOff className="w-4 h-4 mr-1" /> Unpublish</> : <><Eye className="w-4 h-4 mr-1" /> Publish</>}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCourse(course.id)}>
                      <Trash2 className="w-4 h-4" />
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
