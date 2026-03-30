import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, BookOpen, Brain, CheckCircle } from "lucide-react";

const Progress = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const [enrollRes, attRes] = await Promise.all([
        supabase.from("enrollments").select("*, courses(title, title_hi)").eq("user_id", user.id),
        supabase.from("test_attempts").select("*").eq("user_id", user.id),
      ]);
      setEnrollments(enrollRes.data || []);
      setAttempts(attRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const avgScore = attempts.length
    ? (attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">
            Progress / प्रगति
          </h1>
          <p className="text-sm text-muted-foreground">Track your learning journey / अपनी शिक्षा यात्रा ट्रैक करें</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl p-5 border border-border text-center">
                <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-extrabold text-foreground">{enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                <p className="text-xs text-primary">नामांकित कोर्स</p>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border text-center">
                <Brain className="w-8 h-8 mx-auto text-secondary mb-2" />
                <p className="text-2xl font-extrabold text-foreground">{attempts.length}</p>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-xs text-primary">दिए गए टेस्ट</p>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-emerald mb-2" />
                <p className="text-2xl font-extrabold text-foreground">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-xs text-primary">औसत स्कोर</p>
              </div>
            </div>

            {/* Enrolled Courses Progress */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">
                Course Progress / कोर्स प्रगति
              </h2>
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No courses enrolled yet / अभी कोई कोर्स नामांकित नहीं है
                </p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{(enr as any).courses?.title}</p>
                        <p className="text-xs text-primary">{(enr as any).courses?.title_hi}</p>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-saffron rounded-full transition-all"
                            style={{ width: `${enr.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground">{enr.progress || 0}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Results */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">
                Recent Test Results / हाल के टेस्ट परिणाम
              </h2>
              {attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tests taken yet / अभी कोई टेस्ट नहीं दिया
                </p>
              ) : (
                <div className="space-y-3">
                  {attempts.slice(0, 10).map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Score: {att.score}/{att.total_marks}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(att.created_at).toLocaleDateString("hi-IN")}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        (att.percentage || 0) >= 70 ? "text-emerald" : (att.percentage || 0) >= 40 ? "text-gold" : "text-destructive"
                      }`}>
                        {att.percentage?.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Progress;
