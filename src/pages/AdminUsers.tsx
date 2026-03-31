import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending">("all");

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
    toast.success(verified ? "User approved!" : "User verification removed");
    fetchData();
  };

  let filtered = profiles.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)
  );

  if (filter === "pending") {
    filtered = filtered.filter((p) => {
      const role = getRole(p.user_id);
      return (role === "teacher" || role === "student") && !p.is_verified;
    });
  }

  const pendingCount = profiles.filter((p) => {
    const role = getRole(p.user_id);
    return (role === "teacher") && !p.is_verified;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold font-heading text-foreground">User Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage all platform users</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border text-center">
            <p className="text-lg sm:text-2xl font-extrabold text-foreground">{profiles.length}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Total</p>
          </div>
          <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border text-center">
            <p className="text-lg sm:text-2xl font-extrabold text-foreground">
              {roles.filter((r) => r.role === "teacher").length}
            </p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Teachers</p>
          </div>
          <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border text-center">
            <p className="text-lg sm:text-2xl font-extrabold text-foreground">
              {roles.filter((r) => r.role === "student").length}
            </p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Students</p>
          </div>
          <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border text-center cursor-pointer" onClick={() => setFilter(filter === "pending" ? "all" : "pending")}>
            <p className="text-lg sm:text-2xl font-extrabold text-destructive">{pendingCount}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            All Users
          </button>
          <button onClick={() => setFilter("pending")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "pending" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Pending Approval {pendingCount > 0 && `(${pendingCount})`}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden space-y-2.5">
              {filtered.map((profile) => (
                <div key={profile.id} className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{profile.full_name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{profile.phone || "No phone"}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      getRole(profile.user_id) === "admin"
                        ? "bg-destructive/10 text-destructive"
                        : getRole(profile.user_id) === "teacher"
                        ? "bg-accent/10 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getRole(profile.user_id)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{profile.state ? `${profile.district || ""}, ${profile.state}` : "—"}</span>
                    <div className="flex items-center gap-1.5">
                      {profile.is_verified ? (
                        <span className="text-emerald-500">✓ Approved</span>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-emerald-500" onClick={() => handleVerify(profile.user_id, true)}>
                            <CheckCircle className="w-3 h-3 mr-0.5" /> Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Name</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Role</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Phone</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Location</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Status</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((profile) => (
                      <tr key={profile.id} className="border-b border-border hover:bg-muted/30">
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
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            getRole(profile.user_id) === "admin"
                              ? "bg-destructive/10 text-destructive"
                              : getRole(profile.user_id) === "teacher"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {getRole(profile.user_id)}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{profile.phone || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {profile.state ? `${profile.district || ""}, ${profile.state}` : "—"}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-medium ${profile.is_verified ? "text-emerald-500" : "text-destructive"}`}>
                            {profile.is_verified ? "✓ Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3">
                          {!profile.is_verified ? (
                            <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleVerify(profile.user_id, true)}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px] text-muted-foreground" onClick={() => handleVerify(profile.user_id, false)}>
                              <XCircle className="w-3 h-3 mr-1" /> Revoke
                            </Button>
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

export default AdminUsers;
