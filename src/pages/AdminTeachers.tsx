import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, XCircle, GraduationCap, Mail, Phone, MapPin, School } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminTeachers = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchTeachers = async () => {
    // Get all teacher role user_ids
    const { data: teacherRoles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
    const teacherIds = (teacherRoles || []).map((r: any) => r.user_id);
    if (teacherIds.length === 0) { setTeachers([]); setLoading(false); return; }

    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", teacherIds);

    // Get course counts per teacher
    const { data: courses } = await supabase.from("courses").select("created_by").in("created_by", teacherIds);
    const courseCounts: Record<string, number> = {};
    (courses || []).forEach((c: any) => { courseCounts[c.created_by] = (courseCounts[c.created_by] || 0) + 1; });

    const enriched = (profiles || []).map((p: any) => ({ ...p, courseCount: courseCounts[p.user_id] || 0 }));
    setTeachers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleVerify = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(verified ? (isHi ? "शिक्षक स्वीकृत!" : "Teacher approved!") : (isHi ? "स्वीकृति हटाई" : "Approval revoked"));
    fetchTeachers();
  };

  let filtered = teachers.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search) || p.school?.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "pending") filtered = filtered.filter((p) => !p.is_verified);
  if (filter === "approved") filtered = filtered.filter((p) => p.is_verified);

  const pendingCount = teachers.filter((p) => !p.is_verified).length;
  const approvedCount = teachers.filter((p) => p.is_verified).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {isHi ? "शिक्षक प्रबंधन" : "Teacher Management"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{isHi ? "सभी शिक्षकों को मैनेज करें" : "Manage all platform teachers"}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={isHi ? "नाम, फ़ोन, स्कूल..." : "Name, phone, school..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("all")}>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">{teachers.length}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "कुल शिक्षक" : "Total Teachers"}</p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("approved")}>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-500">{approvedCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "स्वीकृत" : "Approved"}</p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("pending")}>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-500">{pendingCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "लंबित" : "Pending"}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {([
            { key: "all", label: isHi ? "सभी" : "All" },
            { key: "approved", label: isHi ? "स्वीकृत" : "Approved" },
            { key: "pending", label: `${isHi ? "लंबित" : "Pending"}${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <GraduationCap className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">{isHi ? "कोई शिक्षक नहीं मिला" : "No teachers found"}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((teacher) => (
              <div key={teacher.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {teacher.avatar_url ? (
                      <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${teacher.avatar_url}`} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      teacher.full_name?.charAt(0)?.toUpperCase() || "T"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{teacher.full_name || "—"}</p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        teacher.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {teacher.is_verified ? (isHi ? "स्वीकृत" : "Approved") : (isHi ? "लंबित" : "Pending")}
                      </span>
                    </div>
                    {teacher.bio && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{teacher.bio}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-muted-foreground mb-3">
                  {teacher.phone && (
                    <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{teacher.phone}</div>
                  )}
                  {teacher.school && (
                    <div className="flex items-center gap-1"><School className="w-3 h-3" />{teacher.school}</div>
                  )}
                  {teacher.state && (
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{teacher.district ? `${teacher.district}, ` : ""}{teacher.state}</div>
                  )}
                  <div className="flex items-center gap-1">📚 {teacher.courseCount} {isHi ? "कोर्स" : "courses"}</div>
                </div>

                <div className="flex gap-2">
                  {!teacher.is_verified ? (
                    <Button size="sm" onClick={() => handleVerify(teacher.user_id, true)}
                      className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> {isHi ? "स्वीकृत करें" : "Approve"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleVerify(teacher.user_id, false)}
                      className="flex-1 h-8 text-xs text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> {isHi ? "हटाएँ" : "Revoke"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTeachers;
