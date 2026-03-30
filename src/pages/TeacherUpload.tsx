import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TeacherUpload = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
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
      </div>
    </DashboardLayout>
  );
};

export default TeacherUpload;
