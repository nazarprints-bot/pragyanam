import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { User, BookOpen, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const TeachersBrowse = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      // Get all teacher user_ids
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      const teacherIds = (roles || []).map((r) => r.user_id);

      if (teacherIds.length === 0) {
        setLoading(false);
        return;
      }

      const [profilesRes, coursesRes] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", teacherIds),
        supabase.from("courses").select("created_by").eq("is_published", true).in("created_by", teacherIds),
      ]);

      setTeachers(profilesRes.data || []);

      const counts: Record<string, number> = {};
      (coursesRes.data || []).forEach((c: any) => {
        counts[c.created_by] = (counts[c.created_by] || 0) + 1;
      });
      setCourseCounts(counts);
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  const filtered = teachers.filter((t) =>
    t.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 lg:pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">{t("teachers.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("teachers.subtitle")}</p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("teachers.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground">{t("teachers.noTeachers")}</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((teacher) => (
              <button
                key={teacher.user_id}
                onClick={() => navigate(`/dashboard/teachers/${teacher.user_id}`)}
                className="bg-card rounded-2xl border border-border p-5 text-left hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {teacher.avatar_url ? (
                      <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${teacher.avatar_url}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : teacher.full_name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{teacher.full_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {courseCounts[teacher.user_id] || 0} {t("teachers.courses")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {teacher.bio && <p className="text-xs text-muted-foreground line-clamp-2">{teacher.bio}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default TeachersBrowse;
