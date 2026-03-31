import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [profRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);
      setProfiles(profRes.data || []);
      setRoles(rolesRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const getRole = (userId: string) => {
    const r = roles.find((r) => r.user_id === userId);
    return r?.role || "student";
  };

  const filtered = profiles.filter(
    (p) => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search)
  );

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
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border text-center">
            <p className="text-lg sm:text-2xl font-extrabold text-foreground">{profiles.length}</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground">Total Users</p>
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
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-7 h-7 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden space-y-2.5">
              {filtered.map((profile) => (
                <div key={profile.id} className="bg-card rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-[10px] font-bold text-navy dark:text-gold shrink-0">
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
                        ? "bg-gold/10 text-gold-warm"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getRole(profile.user_id)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Joined {new Date(profile.created_at).toLocaleDateString("en-IN")}</span>
                    <span className={profile.is_verified ? "text-emerald" : ""}>
                      {profile.is_verified ? "✓ Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-navy/5 dark:bg-gold/5">
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Name</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Role</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Phone</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Joined</th>
                      <th className="text-left p-3 text-xs font-semibold text-foreground">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((profile) => (
                      <tr key={profile.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-navy/10 dark:bg-gold/10 flex items-center justify-center text-[10px] font-bold text-navy dark:text-gold">
                              {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span className="text-xs font-medium text-foreground">{profile.full_name || "—"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            getRole(profile.user_id) === "admin"
                              ? "bg-destructive/10 text-destructive"
                              : getRole(profile.user_id) === "teacher"
                              ? "bg-gold/10 text-gold-warm"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {getRole(profile.user_id)}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{profile.phone || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] ${profile.is_verified ? "text-emerald" : "text-muted-foreground"}`}>
                            {profile.is_verified ? "✓ Verified" : "Pending"}
                          </span>
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
