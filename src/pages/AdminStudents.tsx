import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, XCircle, Users, Phone, MapPin, School, Eye, Calendar, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

type FilterType = "all" | "free" | "paid" | "pending" | "approved";

const AdminStudents = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const fetchStudents = async () => {
    const { data: studentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
    const studentIds = (studentRoles || []).map((r: any) => r.user_id);
    if (studentIds.length === 0) { setStudents([]); setLoading(false); return; }

    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", studentIds);

    const { data: enrollments } = await supabase.from("enrollments").select("user_id").in("user_id", studentIds);
    const enrollCounts: Record<string, number> = {};
    (enrollments || []).forEach((e: any) => { enrollCounts[e.user_id] = (enrollCounts[e.user_id] || 0) + 1; });

    const { data: attempts } = await supabase.from("test_attempts").select("user_id, percentage").in("user_id", studentIds);
    const testCounts: Record<string, number> = {};
    const testScores: Record<string, number[]> = {};
    (attempts || []).forEach((a: any) => {
      testCounts[a.user_id] = (testCounts[a.user_id] || 0) + 1;
      if (a.percentage != null) {
        if (!testScores[a.user_id]) testScores[a.user_id] = [];
        testScores[a.user_id].push(Number(a.percentage));
      }
    });

    const enriched = (profiles || []).map((p: any) => ({
      ...p,
      enrollCount: enrollCounts[p.user_id] || 0,
      testCount: testCounts[p.user_id] || 0,
      avgScore: testScores[p.user_id] ? Math.round(testScores[p.user_id].reduce((a: number, b: number) => a + b, 0) / testScores[p.user_id].length) : null,
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
    if (selectedStudent?.user_id === userId) {
      setSelectedStudent((prev: any) => prev ? { ...prev, is_verified: verified } : null);
    }
  };

  let filtered = students.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search) || p.school?.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "free") filtered = filtered.filter((p) => p.is_free_student);
  if (filter === "paid") filtered = filtered.filter((p) => !p.is_free_student);
  if (filter === "pending") filtered = filtered.filter((p) => !p.is_verified);
  if (filter === "approved") filtered = filtered.filter((p) => p.is_verified);

  const freeCount = students.filter((p) => p.is_free_student).length;
  const paidCount = students.filter((p) => !p.is_free_student).length;
  const pendingCount = students.filter((p) => !p.is_verified).length;
  const approvedCount = students.filter((p) => p.is_verified).length;

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
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {[
            { key: "all" as FilterType, count: students.length, label: isHi ? "कुल" : "Total", color: "text-foreground" },
            { key: "approved" as FilterType, count: approvedCount, label: isHi ? "स्वीकृत" : "Approved", color: "text-emerald-500" },
            { key: "pending" as FilterType, count: pendingCount, label: isHi ? "लंबित" : "Pending", color: "text-amber-500" },
            { key: "paid" as FilterType, count: paidCount, label: isHi ? "पेड" : "Paid", color: "text-primary" },
            { key: "free" as FilterType, count: freeCount, label: isHi ? "मुफ़्त" : "Free", color: "text-destructive" },
          ].map((s) => (
            <div key={s.key} className="bg-card rounded-xl p-2.5 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter(s.key)}>
              <p className={`text-lg sm:text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-[9px] sm:text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit overflow-x-auto">
          {([
            { key: "all" as FilterType, label: isHi ? "सभी" : "All" },
            { key: "approved" as FilterType, label: isHi ? "स्वीकृत" : "Approved" },
            { key: "pending" as FilterType, label: `${isHi ? "लंबित" : "Pending"}${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
            { key: "paid" as FilterType, label: isHi ? "पेड" : "Paid" },
            { key: "free" as FilterType, label: isHi ? "मुफ़्त" : "Free" },
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
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${student.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {student.is_verified ? (isHi ? "स्वीकृत" : "Approved") : (isHi ? "लंबित" : "Pending")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex gap-3">
                      <span>📚 {student.enrollCount}</span>
                      <span>📝 {student.testCount}</span>
                      {student.avgScore != null && <span>📊 {student.avgScore}%</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setSelectedStudent(student)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      {!student.is_verified ? (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-emerald-500" onClick={() => handleVerify(student.user_id, true)}>
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-destructive" onClick={() => handleVerify(student.user_id, false)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
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
                      <th className="text-center p-3 text-xs font-semibold text-foreground">{isHi ? "कोर्स" : "Courses"}</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">{isHi ? "टेस्ट" : "Tests"}</th>
                      <th className="text-center p-3 text-xs font-semibold text-foreground">{isHi ? "स्कोर" : "Avg %"}</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">{isHi ? "स्थिति" : "Status"}</th>
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
                        <td className="p-3 text-xs text-center text-foreground font-medium">{student.enrollCount}</td>
                        <td className="p-3 text-xs text-center text-foreground font-medium">{student.testCount}</td>
                        <td className="p-3 text-xs text-center text-foreground font-medium">{student.avgScore != null ? `${student.avgScore}%` : "—"}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              student.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {student.is_verified ? (isHi ? "स्वीकृत" : "Approved") : (isHi ? "लंबित" : "Pending")}
                            </span>
                            {student.is_free_student && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {isHi ? "मुफ़्त" : "Free"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setSelectedStudent(student)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {!student.is_verified ? (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-emerald-500" onClick={() => handleVerify(student.user_id, true)}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-destructive" onClick={() => handleVerify(student.user_id, false)}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
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

      {/* Student Detail Sheet */}
      <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg">{isHi ? "छात्र विवरण" : "Student Details"}</SheetTitle>
          </SheetHeader>
          {selectedStudent && (
            <div className="mt-6 space-y-5">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                  {selectedStudent.avatar_url ? (
                    <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedStudent.avatar_url}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.full_name?.charAt(0)?.toUpperCase() || "S"
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedStudent.full_name || "—"}</h3>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedStudent.is_verified ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {selectedStudent.is_verified ? (isHi ? "स्वीकृत" : "Approved") : (isHi ? "लंबित" : "Pending")}
                    </span>
                    {selectedStudent.is_free_student && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {isHi ? "मुफ़्त" : "Free"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">{isHi ? "व्यक्तिगत जानकारी" : "Personal Info"}</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { icon: BookOpen, label: isHi ? "कक्षा" : "Class Level", value: selectedStudent.class_level },
                    { icon: Phone, label: isHi ? "फ़ोन" : "Phone", value: selectedStudent.phone },
                    { icon: Phone, label: isHi ? "अभिभावक फ़ोन" : "Parent Phone", value: selectedStudent.parent_phone },
                    { icon: School, label: isHi ? "स्कूल" : "School", value: selectedStudent.school },
                    { icon: MapPin, label: isHi ? "जिला" : "District", value: selectedStudent.district },
                    { icon: MapPin, label: isHi ? "राज्य" : "State", value: selectedStudent.state },
                    { icon: Calendar, label: isHi ? "शामिल हुए" : "Joined", value: selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString("en-IN") : null },
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
                    <p className="text-lg font-bold text-foreground">{selectedStudent.enrollCount}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "कोर्स" : "Courses"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{selectedStudent.testCount}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "टेस्ट" : "Tests"}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold text-foreground">{selectedStudent.avgScore != null ? `${selectedStudent.avgScore}%` : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{isHi ? "औसत" : "Avg Score"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!selectedStudent.is_verified ? (
                  <Button onClick={() => handleVerify(selectedStudent.user_id, true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> {isHi ? "स्वीकृत करें" : "Approve"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleVerify(selectedStudent.user_id, false)}
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

export default AdminStudents;
