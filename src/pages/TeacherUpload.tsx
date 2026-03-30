import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TeacherUpload = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseForm, setCourseForm] = useState({
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    category: "school",
    class_level: "",
    price: "0",
    is_free: false,
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("courses").insert({
      title: courseForm.title,
      title_hi: courseForm.title_hi,
      description: courseForm.description,
      description_hi: courseForm.description_hi,
      category: courseForm.category,
      class_level: courseForm.class_level || null,
      price: Number(courseForm.price),
      is_free: courseForm.is_free,
      is_published: false,
      created_by: user.id,
    });
    if (error) {
      toast.error("Failed to create course: " + error.message);
    } else {
      toast.success("Course created! / कोर्स बन गया!");
      setCourseForm({ title: "", title_hi: "", description: "", description_hi: "", category: "school", class_level: "", price: "0", is_free: false });
      await fetchMyCourses();
    }
    setLoading(false);
  };

  const fetchMyCourses = async () => {
    if (!user) return;
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load courses: " + error.message);
    } else {
      setCourses(data || []);
    }
    setLoadingCourses(false);
  };

  const togglePublish = async (course: any) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);

    if (error) {
      toast.error("Failed to update course: " + error.message);
      return;
    }

    toast.success(
      course.is_published
        ? "Course moved to draft / कोर्स ड्राफ्ट में गया"
        : "Course published / कोर्स पब्लिश हो गया"
    );
    await fetchMyCourses();
  };

  const deleteCourse = async (courseId: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast.error("Failed to delete course: " + error.message);
      return;
    }
    toast.success("Course deleted / कोर्स हट गया");
    await fetchMyCourses();
  };

  useEffect(() => {
    if (user) fetchMyCourses();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">
            Upload Content / कंटेंट अपलोड करें
          </h1>
          <p className="text-sm text-muted-foreground">Create courses and upload study material</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create New Course / नया कोर्स बनाएं
          </h2>

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English)</Label>
                <Input required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Mathematics Class 10" className="mt-1" />
              </div>
              <div>
                <Label>Title (Hindi / शीर्षक)</Label>
                <Input required value={courseForm.title_hi} onChange={(e) => setCourseForm({ ...courseForm, title_hi: e.target.value })} placeholder="जैसे गणित कक्षा 10" className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Description (English)</Label>
              <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description" className="mt-1" />
            </div>

            <div>
              <Label>Description (Hindi / विवरण)</Label>
              <Textarea value={courseForm.description_hi} onChange={(e) => setCourseForm({ ...courseForm, description_hi: e.target.value })} placeholder="कोर्स का विवरण" className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="school">School</option>
                  <option value="competitive">Competitive</option>
                  <option value="scholarship">Scholarship</option>
                </select>
              </div>
              <div>
                <Label>Class Level</Label>
                <Input value={courseForm.class_level} onChange={(e) => setCourseForm({ ...courseForm, class_level: e.target.value })} placeholder="e.g. 10" className="mt-1" />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} className="mt-1" />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={courseForm.is_free} onChange={(e) => setCourseForm({ ...courseForm, is_free: e.target.checked })} className="rounded" />
              <span className="text-sm text-foreground">This course is free / यह कोर्स मुफ्त है</span>
            </label>

            <Button type="submit" disabled={loading} className="gradient-saffron border-0 text-primary-foreground font-bold">
              {loading ? "Creating..." : "Create Course / कोर्स बनाएं"}
            </Button>
          </form>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            My Courses / मेरे कोर्स
          </h2>

          {loadingCourses ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet / अभी कोई कोर्स नहीं</p>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">{course.title}</p>
                    <p className="text-xs text-primary">{course.title_hi}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.is_published ? "Published / प्रकाशित" : "Draft / ड्राफ्ट"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(course)}
                    >
                      {course.is_published ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" /> Publish
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCourse(course.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
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
