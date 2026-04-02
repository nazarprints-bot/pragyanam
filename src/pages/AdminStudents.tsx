import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, XCircle, Users, Phone, MapPin, School, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type FilterType = "all" | "free" | "paid" | "pending";

const AdminStudents = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchStudents = async () => {
    const { data: studentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
    const studentIds = (studentRoles || []).map((r: any) => r.user_id);
    if (studentIds.length === 0) { setStudents([]); setLoading(false); return; }

    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", studentIds);

    // Get enrollment counts
    const { data: enrollments } = await supabase.from("enrollments").select("user_id").in("user_id", studentIds);
    const enrollCounts: Record<string, number> = {};
    (enrollments || []).forEach((e: any) => { enrollCounts[e.user_id] = (enrollCounts[e.user_id] || 0) + 1; });

    // Get test attempt counts
    const { data: attempts } = await supabase.from("test_attempts").select("user_id").in("user_id", studentIds);
    const testCounts: Record<string, number> = {};
    (attempts || []).forEach((a: any) => { testCounts[a.user_id] = (testCounts[a.user_id] || 0) + 1; });

    const enriched = (profiles || []).map((p: any) => ({
      ...p,
      enrollCount: enrollCounts[p.user_id] || 0,
      testCount: testCounts[p.user_id] || 0,
    }));
    setStudents(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleVerify = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(verified ? (isHi ? "छात्र स्वीकृत!" : "Student approved!") : (isHi ? "स्वीकृति हटाई" : "Approval revoked"));
    fetchStudents();
  };

  let filtered = students.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search) || p.school?.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "free") filtered = filtered.filter((p) => p.is_free_student);
  if (filter === "paid") filtered = filtered.filter((p) => !p.is_free_student);
  if (filter === "pending") filtered = filtered.filter((p) => p.is_free_student && !p.is_verified);

  const freeCount = students.filter((p) => p.is_free_student).length;
  const paidCount = students.filter((p) => !p.is_free_student).length;
  const pendingCount = students.filter((p) => p.is_free_student && !p.is_verified).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {isHi ? "छात्र प्रबंधन" : "Student Management"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{isHi ? "सभी छात्रों को मैनेज करें" : "Manage all platform students"}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={isHi ? "नाम, फ़ोन, स्कूल..." : "Name, phone, school..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("all")}>
            <p className="text-lg sm:text-2xl font-extrabold text-foreground">{students.length}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "कुल" : "Total"}</p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("paid")}>
            <p className="text-lg sm:text-2xl font-extrabold text-primary">{paidCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "पेड" : "Paid"}</p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("free")}>
            <p className="text-lg sm:text-2xl font-extrabold text-amber-500">{freeCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "मुफ़्त" : "Free"}</p>
          </div>
          <div className="bg-card rounded-xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter("pending")}>
            <p className="text-lg sm:text-2xl font-extrabold text-destructive">{pendingCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">{isHi ? "लंबित" : "Pending"}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit overflow-x-auto">
          {([
            { key: "all" as FilterType, label: isHi ? "सभी" : "All" },
            { key: "paid" as FilterType, label: isHi ? "पेड" : "Paid" },
            { key: "free" as FilterType, label: isHi ? "मुफ़्त" : "Free" },
            { key: "pending" as FilterType, label: `${isHi ? "लंबित" : "Pending"}${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${filter === f.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">{isHi ? "कोई छात्र नहीं मिला" : "No students found"}</p>
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="sm:hidden space-y-2.5">
              {filtered.map((student) => (
                <div key={student.id} className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{student.full_name || "—"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {student.class_level && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{isHi ? "कक्षा" : "Class"} {student.class_level}</span>}
                        {student.is_free_student && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">{isHi ? "मुफ़्त" : "Free"}</span>}
                      </div>
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      student.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {student.is_verified ? "✓" : "⏳"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex gap-3">
                      <span>📚 {student.enrollCount}</span>
                      <span>📝 {student.testCount}</span>
                    </div>
                    {student.is_free_student && !student.is_verified && (
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-emerald-500" onClick={() => handleVerify(student.user_id, true)}>
                        <CheckCircle className="w-3 h-3 mr-0.5" /> {isHi ? "स्वीकृत" : "Approve"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "नाम" : "Name"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "कक्षा" : "Class"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "फ़ोन" : "Phone"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "स्थान" : "Location"}</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">{isHi ? "कोर्स" : "Courses"}</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">{isHi ? "टेस्ट" : "Tests"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "प्रकार" : "Type"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "कार्रवाई" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student) => (
                      <tr key={student.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <span className="text-xs font-medium text-foreground block">{student.full_name || "—"}</span>
                              {student.school && <span className="text-[10px] text-muted-foreground">{student.school}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-foreground">{student.class_level || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">{student.phone || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {student.state ? `${student.district || ""}, ${student.state}` : "—"}
                        </td>
                        <td className="p-3 text-xs text-center text-foreground font-medium">{student.enrollCount}</td>
                        <td className="p-3 text-xs text-center text-foreground font-medium">{student.testCount}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            student.is_free_student ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                          }`}>
                            {student.is_free_student ? (isHi ? "मुफ़्त" : "Free") : (isHi ? "पेड" : "Paid")}
                          </span>
                        </td>
                        <td className="p-3">
                          {student.is_free_student && !student.is_verified ? (
                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleVerify(student.user_id, true)}>
                              <CheckCircle className="w-3 h-3 mr-1" /> {isHi ? "स्वीकृत" : "Approve"}
                            </Button>
                          ) : student.is_free_student && student.is_verified ? (
                            <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px] text-muted-foreground" onClick={() => handleVerify(student.user_id, false)}>
                              <XCircle className="w-3 h-3 mr-1" /> {isHi ? "हटाएँ" : "Revoke"}
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
