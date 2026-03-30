import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Tests = () => {
  const { user, role } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [user, role]);

  const getAttempt = (testId: string) => attempts.find((a) => a.test_id === testId);

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
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {test.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-0.5">{test.title}</h3>
                  <p className="text-xs text-primary mb-3">{test.title_hi}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.duration_minutes} min
                    </span>
                    <span>{test.total_marks} marks</span>
                  </div>
                  {attempt ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald text-sm font-medium">
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
