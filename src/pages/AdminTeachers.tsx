import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, XCircle, GraduationCap, Phone, MapPin, School, Eye, Calendar, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const AdminTeachers = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const fetchTeachers = async () => {
    const { data: teacherRoles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
    const teacherIds = (teacherRoles || []).map((r: any) => r.user_id);
    if (teacherIds.length === 0) { setTeachers([]); setLoading(false); return; }

    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", teacherIds);

    const { data: courses } = await supabase.from("courses").select("created_by").in("created_by", teacherIds);
    const courseCounts: Record<string, number> = {};
    (courses || []).forEach((c: any) => { courseCounts[c.created_by] = (courseCounts[c.created_by] || 0) + 1; });

    // Get live class counts
    const { data: liveClasses } = await supabase.from("live_classes").select("teacher_id").in("teacher_id", teacherIds);
    const liveCounts: Record<string, number> = {};
    (liveClasses || []).forEach((l: any) => { liveCounts[l.teacher_id] = (liveCounts[l.teacher_id] || 0) + 1; });

    // Get test counts
    const { data: tests } = await supabase.from("tests").select("created_by").in("created_by", teacherIds);
    const testCounts: Record<string, number> = {};
    (tests || []).forEach((t: any) => { if (t.created_by) testCounts[t.created_by] = (testCounts[t.created_by] || 0) + 1; });

    const enriched = (profiles || []).map((p: any) => ({
      ...p,
      courseCount: courseCounts[p.user_id] || 0,
      liveClassCount: liveCounts[p.user_id] || 0,
      testCount: testCounts[p.user_id] || 0,
    }));
    setTeachers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleVerify = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(verified ? (isHi ? "शिक्षक स्वीकृत!" : "Teacher approved!") : (isHi ? "स्वीकृति हटाई" : "Approval revoked"));
    fetchTeachers();
    if (selectedTeacher?.user_id === userId) {
      setSelectedTeacher((prev: any) => prev ? { ...prev, is_verified: verified } : null);
    }
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
                  <Button size="sm" variant="outline" onClick={() => setSelectedTeacher(teacher)}
                    className="flex-1 h-8 text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1" /> {isHi ? "विवरण देखें" : "View Details"}
                  </Button>
                  {!teacher.is_verified ? (
                    <Button size="sm" onClick={() => handleVerify(teacher.user_id, true)}
                      className="flex-1 h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> {isHi ? "स्वीकृत करें" : "Approve"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleVerify(teacher.user_id, false)}
                      className="flex-1 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> {isHi ? "हटाएँ" : "Revoke"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Detail Sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg">{isHi ? "शिक्षक विवरण" : "Teacher Details"}</SheetTitle>
          </SheetHeader>
          {selectedTeacher && (
            <div className="mt-6 space-y-5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                  {selectedTeacher.avatar_url ? (
                    <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedTeacher.avatar_url}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedTeacher.full_name?.charAt(0)?.toUpperCase() || "T"
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedTeacher.full_name || "—"}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    selectedTeacher.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {selectedTeacher.is_verified ? (isHi ? "स्वीकृत" : "Approved") : (isHi ? "लंबित" : "Pending")}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedTeacher.bio && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{isHi ? "परिचय" : "Bio"}</p>
                  <p className="text-sm text-foreground">{selectedTeacher.bio}</p>
                </div>
              )}

              {/* Info Grid */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">{isHi ? "संपर्क जानकारी" : "Contact Info"}</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { icon: Phone, label: isHi ? "फ़ोन" : "Phone", value: selectedTeacher.phone },
                    { icon: School, label: isHi ? "स्कूल" : "School", value: selectedTeacher.school },
                    { icon: MapPin, label: isHi ? "जिला" : "District", value: selectedTeacher.district },
                    { icon: MapPin, label: isHi ? "राज्य" : "State", value: selectedTeacher.state },
                    { icon: Calendar, label: isHi ? "शामिल हुए" : "Joined", value: selectedTeacher.created_at ? new Date(selectedTeacher.created_at).toLocaleDateString("en-IN") : null },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg">
                      <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-xs font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">{isHi ? "गतिविधि" : "Activity"}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{selectedTeacher.courseCount}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "कोर्स" : "Courses"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{selectedTeacher.liveClassCount}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "लाइव क्लास" : "Live Classes"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{selectedTeacher.testCount}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "टेस्ट" : "Tests"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!selectedTeacher.is_verified ? (
                  <Button onClick={() => handleVerify(selectedTeacher.user_id, true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> {isHi ? "स्वीकृत करें" : "Approve"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleVerify(selectedTeacher.user_id, false)}
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="w-4 h-4 mr-1.5" /> {isHi ? "स्वीकृति हटाएँ" : "Revoke Approval"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminTeachers;
