import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Users, GraduationCap, Shield, CheckCircle, XCircle, Ban, Eye, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

type TabType = "all" | "teachers" | "students" | "admins";

const AdminUsers = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("all");

  const isHindi = language === "hindi";

  const fetchData = async () => {
    const [profRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles(profRes.data || []);
    setRoles(rolesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getRole = (userId: string) => {
    const r = roles.find((r) => r.user_id === userId);
    return r?.role || "student";
  };

  const handleVerify = async (userId: string, verified: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success(verified ? (isHindi ? "स्वीकृत!" : "Approved!") : (isHindi ? "स्वीकृति हटाई" : "Approval revoked"));
    fetchData();
  };

  const teacherIds = new Set(roles.filter(r => r.role === "teacher").map(r => r.user_id));
  const adminIds = new Set(roles.filter(r => r.role === "admin").map(r => r.user_id));
  const studentIds = new Set(
    profiles
      .filter(p => !teacherIds.has(p.user_id) && !adminIds.has(p.user_id))
      .map(p => p.user_id)
  );

  const counts = {
    all: profiles.length,
    teachers: teacherIds.size,
    students: studentIds.size,
    admins: adminIds.size,
  };

  let filtered = profiles.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)
  );

  if (tab === "teachers") filtered = filtered.filter(p => teacherIds.has(p.user_id));
  else if (tab === "students") filtered = filtered.filter(p => studentIds.has(p.user_id));
  else if (tab === "admins") filtered = filtered.filter(p => adminIds.has(p.user_id));

  const tabs: { key: TabType; label: string; labelHi: string; icon: any; count: number }[] = [
    { key: "all", label: "All Users", labelHi: "सभी उपयोगकर्ता", icon: Users, count: counts.all },
    { key: "teachers", label: "Teachers", labelHi: "शिक्षक", icon: UserCog, count: counts.teachers },
    { key: "students", label: "Students", labelHi: "छात्र", icon: GraduationCap, count: counts.students },
    { key: "admins", label: "Admins", labelHi: "एडमिन", icon: Shield, count: counts.admins },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-destructive/10 text-destructive border-destructive/20";
      case "teacher": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusBadge = (profile: any) => {
    if (profile.is_disabled) return { text: isHindi ? "निष्क्रिय" : "Disabled", class: "text-destructive" };
    if (profile.is_verified) return { text: isHindi ? "✓ स्वीकृत" : "✓ Approved", class: "text-emerald-500" };
    return { text: isHindi ? "लंबित" : "Pending", class: "text-yellow-500" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              {isHindi ? "उपयोगकर्ता प्रबंधन" : "User Management"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isHindi ? "सभी प्लेटफ़ॉर्म उपयोगकर्ताओं को प्रबंधित करें" : "Manage all platform users"}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input placeholder={isHindi ? "नाम, फ़ोन खोजें..." : "Search name, phone..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm" />
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {tabs.map((t, i) => (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-xl sm:rounded-2xl p-3 sm:p-4 border text-center transition-all duration-200 hover:scale-[1.02] ${
                tab === t.key
                  ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5"
                  : "bg-card border-border hover:border-primary/20"
              }`}
            >
              <t.icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${tab === t.key ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-lg sm:text-2xl font-extrabold ${tab === t.key ? "text-primary" : "text-foreground"}`}>{t.count}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{isHindi ? t.labelHi : t.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Pills */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isHindi ? t.labelHi : t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Quick Navigation to Detailed Pages */}
        {(tab === "teachers" || tab === "students") && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => navigate(tab === "teachers" ? "/dashboard/teachers-manage" : "/dashboard/students-manage")}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              {isHindi
                ? `विस्तृत ${tab === "teachers" ? "शिक्षक" : "छात्र"} प्रबंधन खोलें`
                : `Open detailed ${tab === "teachers" ? "Teacher" : "Student"} Management`}
            </Button>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {/* Mobile card view */}
              <div className="sm:hidden space-y-2.5">
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">{isHindi ? "कोई उपयोगकर्ता नहीं मिला" : "No users found"}</p>
                )}
                {filtered.map((profile, i) => {
                  const role = getRole(profile.user_id);
                  const status = getStatusBadge(profile);
                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl p-3 border border-border hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{profile.full_name || "—"}</p>
                          <p className="text-[10px] text-muted-foreground">{profile.phone || "No phone"}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${getRoleBadge(role)}`}>
                          {role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className={status.class}>{status.text}</span>
                          {profile.state && <span>• {profile.district || ""}, {profile.state}</span>}
                        </div>
                        {!profile.is_verified && role !== "admin" && (
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-emerald-500" onClick={() => handleVerify(profile.user_id, true)}>
                            <CheckCircle className="w-3 h-3 mr-0.5" /> {isHindi ? "स्वीकृत" : "Approve"}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "नाम" : "Name"}</th>
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "भूमिका" : "Role"}</th>
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "फ़ोन" : "Phone"}</th>
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "स्थान" : "Location"}</th>
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "स्थिति" : "Status"}</th>
                        <th className="text-left p-3 text-xs font-semibold text-foreground">{isHindi ? "कार्रवाई" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">{isHindi ? "कोई उपयोगकर्ता नहीं मिला" : "No users found"}</td></tr>
                      )}
                      {filtered.map((profile, i) => {
                        const role = getRole(profile.user_id);
                        const status = getStatusBadge(profile);
                        return (
                          <motion.tr
                            key={profile.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-foreground block">{profile.full_name || "—"}</span>
                                  {profile.school && <span className="text-[10px] text-muted-foreground">{profile.school}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRoleBadge(role)}`}>
                                {role}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">{profile.phone || "—"}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {profile.state ? `${profile.district || ""}, ${profile.state}` : "—"}
                            </td>
                            <td className="p-3">
                              <span className={`text-[10px] font-medium ${status.class}`}>{status.text}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                {!profile.is_verified && role !== "admin" ? (
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleVerify(profile.user_id, true)}>
                                    <CheckCircle className="w-3 h-3 mr-1" /> {isHindi ? "स्वीकृत" : "Approve"}
                                  </Button>
                                ) : profile.is_verified && role !== "admin" ? (
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground" onClick={() => handleVerify(profile.user_id, false)}>
                                    <XCircle className="w-3 h-3 mr-1" /> {isHindi ? "हटाएँ" : "Revoke"}
                                  </Button>
                                ) : null}
                                {role === "teacher" && (
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-primary" onClick={() => navigate("/dashboard/teachers-manage")}>
                                    <Eye className="w-3 h-3 mr-1" /> {isHindi ? "विवरण" : "Details"}
                                  </Button>
                                )}
                                {role === "student" && (
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-primary" onClick={() => navigate("/dashboard/students-manage")}>
                                    <Eye className="w-3 h-3 mr-1" /> {isHindi ? "विवरण" : "Details"}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
