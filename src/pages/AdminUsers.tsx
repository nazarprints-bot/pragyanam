import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Shield, GraduationCap, BookOpen, Search, BarChart3, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">
              User Management / उपयोगकर्ता प्रबंधन
            </h1>
            <p className="text-sm text-muted-foreground">Manage all platform users</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-extrabold text-foreground">{profiles.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-extrabold text-foreground">
              {roles.filter((r) => r.role === "teacher").length}
            </p>
            <p className="text-sm text-muted-foreground">Teachers</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-extrabold text-foreground">
              {roles.filter((r) => r.role === "student").length}
            </p>
            <p className="text-sm text-muted-foreground">Students</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Role</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Phone</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Joined</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((profile) => (
                    <tr key={profile.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-medium text-foreground">{profile.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          getRole(profile.user_id) === "admin" ? "bg-destructive/10 text-destructive" :
                          getRole(profile.user_id) === "teacher" ? "bg-secondary/20 text-secondary" :
                          "bg-accent text-accent-foreground"
                        }`}>
                          {getRole(profile.user_id)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{profile.phone || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("hi-IN")}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs ${profile.is_verified ? "text-emerald" : "text-muted-foreground"}`}>
                          {profile.is_verified ? "✓ Yes" : "✗ No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
