import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const StudentCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, any>>({});
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [coursesRes, enrollRes] = await Promise.all([
        supabase.from("courses").select("*").eq("is_published", true),
        user ? supabase.from("enrollments").select("course_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);
      const courseList = coursesRes.data || [];
      setCourses(courseList);
      setEnrollments((enrollRes.data || []).map((e: any) => e.course_id));

      const teacherIds = [...new Set(courseList.map((c: any) => c.created_by).filter(Boolean))];
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", teacherIds);
        const map: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { map[p.user_id] = p; });
        setTeachers(map);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId });
    if (error) toast.error("Failed to enroll / नामांकन विफल");
    else { setEnrollments([...enrollments, courseId]); toast.success("Enrolled! / नामांकित!"); }
  };

  const filtered = courses.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.title_hi.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">Courses / कोर्स</h1>
            <p className="text-sm text-muted-foreground">Browse and enroll in courses / कोर्स ब्राउज़ करें</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Courses Yet</h3>
            <p className="text-sm text-muted-foreground">अभी कोई कोर्स उपलब्ध नहीं है। जल्द आ रहे हैं!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const isEnrolled = enrollments.includes(course.id);
              const t = teachers[course.created_by];
              return (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card hover:border-gold/20 transition-all cursor-pointer"
                  onClick={() => navigate(`/dashboard/course/${course.id}`)}
                >
                  <div className="h-40 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-navy flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold-warm">{course.category}</span>
                      {course.class_level && <span className="text-xs text-muted-foreground">Class {course.class_level}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                    <p className="text-sm text-gold-warm mb-1">{course.title_hi}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

                    {t && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                        <div className="w-7 h-7 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-navy dark:text-gold font-bold text-xs shrink-0">
                          {t.avatar_url ? (
                            <img src={t.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            t.full_name?.charAt(0)?.toUpperCase() || "T"
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{t.full_name || "Teacher"}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end">
                      {isEnrolled ? (
                        <Button size="sm" variant="outline" className="text-emerald border-emerald/30" onClick={(e) => e.stopPropagation()}>
                          Enrolled ✓
                        </Button>
                      ) : (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }} className="gradient-navy text-white border-0 hover:opacity-90">
                          Enroll <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
