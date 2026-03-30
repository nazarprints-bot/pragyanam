import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Clock, CheckCircle, ArrowRight, Eye, EyeOff, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  sort_order: number;
}

const Tests = () => {
  const { user, role } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Test-taking state
  const [activeTest, setActiveTest] = useState<any | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

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

  // Timer
  useEffect(() => {
    if (!activeTest || result) return;
    if (timeLeft <= 0 && questions.length > 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, activeTest, result, questions.length]);

  const getAttempt = (testId: string) => attempts.find((a) => a.test_id === testId);
  const isTeacherOrAdmin = role === "teacher" || role === "admin";

  const handleStartTest = async (test: any) => {
    const { data, error } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", test.id)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      toast.error("No questions found for this test");
      return;
    }

    setQuestions(data as Question[]);
    setActiveTest(test);
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setTimeLeft((test.duration_minutes || 30) * 60);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    let score = 0;
    let totalMarks = 0;
    questions.forEach((q) => {
      const marks = q.marks || 1;
      totalMarks += marks;
      if (answers[q.id] === q.correct_option) {
        score += marks;
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const timeTaken = (activeTest.duration_minutes || 30) * 60 - timeLeft;

    const { error } = await supabase.from("test_attempts").insert({
      user_id: user!.id,
      test_id: activeTest.id,
      answers: answers,
      score,
      total_marks: totalMarks,
      percentage,
      time_taken_seconds: timeTaken,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to submit: " + error.message);
    } else {
      setResult({ score, total: totalMarks, percentage });
      toast.success("Test submitted!");
      await fetchTests();
    }
    setSubmitting(false);
  };

  const handleExitTest = () => {
    setActiveTest(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setCurrentQ(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePublish = async (test: any) => {
    const { error } = await supabase
      .from("tests")
      .update({ is_published: !test.is_published })
      .eq("id", test.id);
    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      toast.success(test.is_published ? "Test unpublished" : "Test published!");
      fetchTests();
    }
  };

  const deleteTest = async (testId: string) => {
    const { error } = await supabase.from("tests").delete().eq("id", testId);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Test deleted");
      fetchTests();
    }
  };

  // ─── Active Test View ───
  if (activeTest) {
    const q = questions[currentQ];

    // Result screen
    if (result) {
      return (
        <DashboardLayout>
          <div className="max-w-lg mx-auto text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground">Test Completed!</h1>
            <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
              <div className="text-4xl font-extrabold text-navy dark:text-gold">{result.percentage.toFixed(0)}%</div>
              <p className="text-muted-foreground">
                You scored <span className="font-bold text-foreground">{result.score}</span> out of <span className="font-bold text-foreground">{result.total}</span> marks
              </p>
            </div>
            <Button onClick={handleExitTest} className="gradient-navy text-white border-0 hover:opacity-90">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
            </Button>
          </div>
        </DashboardLayout>
      );
    }

    // Question screen
    const options = [
      { key: "A", value: q.option_a },
      { key: "B", value: q.option_b },
      { key: "C", value: q.option_c },
      { key: "D", value: q.option_d },
    ];

    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold font-heading text-foreground truncate">{activeTest.title}</h1>
            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
              timeLeft < 60 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold"
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${
                  i === currentQ
                    ? "bg-navy dark:bg-gold"
                    : answers[questions[i].id]
                    ? "bg-emerald/50"
                    : "bg-muted"
                }`}
                onClick={() => setCurrentQ(i)}
              />
            ))}
          </div>

          {/* Question Card */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQ + 1} of {questions.length}</span>
              <span>{q.marks || 1} mark{(q.marks || 1) > 1 ? "s" : ""}</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{q.question}</h2>
            <div className="space-y-3">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOption(q.id, opt.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                    answers[q.id] === opt.key
                      ? "border-navy bg-navy/10 dark:border-gold dark:bg-gold/10 text-foreground"
                      : "border-border hover:border-navy/30 dark:hover:border-gold/30 text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-xs font-bold mr-3">
                    {opt.key}
                  </span>
                  {opt.value}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((c) => c - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
            {currentQ < questions.length - 1 ? (
              <Button
                className="gradient-navy text-white border-0 hover:opacity-90"
                onClick={() => setCurrentQ((c) => c + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                className="gradient-navy text-white border-0 hover:opacity-90"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                Submit Test
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Tests List View ───
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground">Tests</h1>
          <p className="text-sm text-muted-foreground">
            {role === "student" ? "Take tests and track your performance" : "Manage and create tests"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No Tests Available</h3>
            <p className="text-sm text-muted-foreground">No tests available at the moment</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => {
              const attempt = getAttempt(test.id);
              return (
                <div key={test.id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-card hover:border-gold/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-gold/10 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-navy dark:text-gold" />
                    </div>
                    <div className="flex items-center gap-2">
                      {isTeacherOrAdmin && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          test.is_published ? "bg-emerald/10 text-emerald" : "bg-muted text-muted-foreground"
                        }`}>
                          {test.is_published ? "Published" : "Draft"}
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {test.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-3">{test.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.duration_minutes} min
                    </span>
                    <span>{test.total_marks} marks</span>
                  </div>

                  {isTeacherOrAdmin ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => togglePublish(test)}>
                        {test.is_published ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {test.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTest(test.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : attempt ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </div>
                      <span className="font-bold text-foreground">{attempt.percentage?.toFixed(0)}%</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full gradient-navy text-white border-0 hover:opacity-90"
                      size="sm"
                      onClick={() => handleStartTest(test)}
                    >
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
