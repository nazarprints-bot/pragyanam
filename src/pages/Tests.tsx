import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Clock, CheckCircle, ArrowRight, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Tests = () => {
  const { user, role } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    let testsQuery = supabase.from("tests").select("*");
    if (role === "student") {
      testsQuery = testsQuery.eq("is_published", true);
    }
    const testsRes = await testsQuery;
    setTests(testsRes.data || []);
    if (user) {
      const attRes = await supabase.from("test_attempts").select("*").eq("user_id", user.id);
      setAttempts(attRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTests();
  }, [user, role]);

  const getAttempt = (testId: string) => attempts.find((a) => a.test_id === testId);

  const isTeacherOrAdmin = role === "teacher" || role === "admin";

  const togglePublish = async (test: any) => {
    const { error } = await supabase
      .from("tests")
      .update({ is_published: !test.is_published })
      .eq("id", test.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      toast.success(test.is_published ? "Test unpublished / टेस्ट अनपब्लिश" : "Test published! / टेस्ट पब्लिश हो गया!");
      fetchTests();
    }
  };

  const deleteTest = async (testId: string) => {
    const { error } = await supabase.from("tests").delete().eq("id", testId);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Test deleted / टेस्ट डिलीट हो गया");
      fetchTests();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">
            Tests / टेस्ट
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "student" ? "Take tests and track your performance / टेस्ट दें और अपना प्रदर्शन ट्रैक करें" : "Manage and create tests / टेस्ट बनाएं और प्रबंधित करें"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Tests Available</h3>
            <p className="text-sm text-muted-foreground">अभी कोई टेस्ट उपलब्ध नहीं है</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => {
              const attempt = getAttempt(test.id);
              return (
                <div key={test.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacherOrAdmin && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          test.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        }`}>
                          {test.is_published ? "Published" : "Draft"}
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {test.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-0.5">{test.title}</h3>
                  <p className="text-xs text-primary mb-3">{test.title_hi}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.duration_minutes} min
                    </span>
                    <span>{test.total_marks} marks</span>
                  </div>

                  {isTeacherOrAdmin ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => togglePublish(test)}
                      >
                        {test.is_published ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {test.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : attempt ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </div>
                      <span className="font-bold text-foreground">{attempt.percentage?.toFixed(0)}%</span>
                    </div>
                  ) : (
                    <Button className="w-full gradient-saffron border-0 text-primary-foreground" size="sm">
                      Start Test <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tests;
