import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, Loader2, User, Award, BookOpen, Brain, TrendingUp, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const Profile = () => {
  const { user, profile, role, signOut, refetchProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "certificates">("profile");
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    class_level: profile?.class_level || "",
    language: profile?.language || "english",
    parent_phone: profile?.parent_phone || "",
    school: profile?.school || "",
    state: profile?.state || "",
    district: profile?.district || "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        class_level: profile.class_level || "",
        language: profile.language || "english",
        parent_phone: profile.parent_phone || "",
        school: profile.school || "",
        state: profile.state || "",
        district: profile.district || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user || role !== "student") return;
    const fetchAchievements = async () => {
      const [enrollRes, testRes] = await Promise.all([
        supabase.from("enrollments").select("*, courses(title, title_hi, category)").eq("user_id", user.id),
        supabase.from("test_attempts").select("*, tests(title, title_hi)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setEnrolledCourses(enrollRes.data || []);
      setTestResults(testRes.data || []);
    };
    fetchAchievements();
  }, [user, role]);

  const avatarUrl = profile?.avatar_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: filePath }).eq("user_id", user.id);
      if (updateError) throw updateError;
      await refetchProfile();
      toast.success("Photo updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        class_level: formData.class_level,
        language: formData.language as "hindi" | "english",
        parent_phone: formData.parent_phone || null,
        school: formData.school || null,
        state: formData.state || null,
        district: formData.district || null,
      }).eq("user_id", user.id);
      if (error) throw error;
      await refetchProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleLabel = role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";
  const isStudent = role === "student";
  const passedTests = testResults.filter((t) => (t.percentage || 0) >= 60);
  const avgScore = testResults.length > 0
    ? Math.round(testResults.reduce((sum, t) => sum + (t.percentage || 0), 0) / testResults.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pb-16 lg:pb-0">
        {/* Avatar Section */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted border-2 border-primary/30 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-colors cursor-pointer">
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin opacity-0 group-hover:opacity-100" /> :
                  <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-[15px] font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs sm:text-[13px] text-muted-foreground truncate">{user?.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-primary/15 text-primary rounded-full">{roleLabel}</span>
                {!profile?.is_verified && (role === "teacher" || (role === "student" && profile?.is_free_student)) && (
                  <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-destructive/15 text-destructive rounded-full">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="destructive" onClick={handleSignOut} className="w-full h-10 text-[13px] font-semibold mt-4">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Tabs for student */}
        {isStudent && (
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
            <button onClick={() => setActiveTab("profile")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t("profile.editProfile")}
            </button>
            <button onClick={() => setActiveTab("certificates")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "certificates" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t("profile.certificates")}
            </button>
          </div>
        )}

        {activeTab === "profile" ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Full Name</Label>
                <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Your full name" className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="h-9 text-[13px]" />
              </div>
            </div>

            {isStudent && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Parent's Phone</Label>
                    <Input value={formData.parent_phone} onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} placeholder="9876543210" className="h-9 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">School</Label>
                    <Input value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} placeholder="Enter school name" className="h-9 text-[13px]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px]">Class Level</Label>
                  <Select value={formData.class_level} onValueChange={(v) => setFormData({ ...formData, class_level: v })}>
                    <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">State</Label>
                <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v, district: "" })}>
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">District</Label>
                <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="Enter district" className="h-9 text-[13px]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px]">Language</Label>
              <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Bio</Label>
              <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={role === "teacher" ? "Tell students about yourself..." : "Write something about yourself..."} rows={3} className="text-[13px] resize-none" />
            </div>
            <Button onClick={handleSave} disabled={loading} className="h-9 px-5 text-[13px] font-semibold gradient-navy text-white hover:opacity-90">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <BookOpen className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xl font-bold text-foreground">{enrolledCourses.length}</p>
                <p className="text-[11px] text-muted-foreground">{t("profile.enrolled")}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <Brain className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xl font-bold text-foreground">{passedTests.length}</p>
                <p className="text-[11px] text-muted-foreground">{t("profile.testsPassed")}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-xl font-bold text-foreground">{avgScore}%</p>
                <p className="text-[11px] text-muted-foreground">{t("profile.avgScore")}</p>
              </div>
            </div>

            <section>
              <h3 className="text-lg font-bold font-heading text-foreground mb-3">{t("profile.enrolledCourses")}</h3>
              {enrolledCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-card rounded-xl border border-border p-6 text-center">{t("profile.noCourses")}</p>
              ) : (
                <div className="space-y-2">
                  {enrolledCourses.map((e) => (
                    <div key={e.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{e.courses?.title || "Course"}</h4>
                        <p className="text-xs text-muted-foreground">{e.courses?.category} · {t("profile.progress")}: {e.progress || 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-bold font-heading text-foreground mb-3">{t("profile.testAchievements")}</h3>
              {testResults.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-card rounded-xl border border-border p-6 text-center">{t("profile.noTests")}</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((test) => {
                    const passed = (test.percentage || 0) >= 60;
                    return (
                      <div key={test.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${passed ? "bg-emerald-500/10" : "bg-muted"}`}>
                          <Award className={`w-5 h-5 ${passed ? "text-emerald-500" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm truncate">{test.tests?.title || "Test"}</h4>
                          <p className="text-xs text-muted-foreground">
                            {t("profile.score")}: {test.score}/{test.total_marks} ({test.percentage}%)
                          </p>
                        </div>
                        {passed && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                            ✓ {t("profile.passed")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      <BottomNav />
    </DashboardLayout>
  );
};

export default Profile;
