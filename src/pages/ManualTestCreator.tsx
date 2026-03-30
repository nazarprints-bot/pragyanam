import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Save, Loader2, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ManualQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
}

const emptyQuestion = (): ManualQuestion => ({
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  marks: 1,
});

const ManualTestCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<ManualQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof ManualQuestion, value: string | number) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Enter a test title"); return; }
    if (!user) return;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || !q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        toast.error(`Question ${i + 1} is incomplete`);
        return;
      }
    }

    setSaving(true);
    try {
      const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
      const { data: test, error: testErr } = await supabase
        .from("tests")
        .insert({
          title,
          title_hi: "",
          type: "chapter",
          total_marks: totalMarks,
          duration_minutes: duration,
          is_published: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (testErr) throw testErr;

      const qInsert = questions.map((q, i) => ({
        test_id: test.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        marks: q.marks,
        sort_order: i + 1,
      }));

      const { error: qErr } = await supabase.from("test_questions").insert(qInsert);
      if (qErr) throw qErr;

      toast.success("Test created successfully!");
      navigate("/dashboard/tests");
    } catch (err: any) {
      toast.error(err.message || "Failed to create test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-navy dark:text-gold" />
              Create Test Manually
            </h1>
            <p className="text-sm text-muted-foreground">Add questions one by one</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard/ai-test")}>
            <Sparkles className="w-4 h-4 mr-1" /> Use AI Instead
          </Button>
        </div>

        {/* Test Info */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Test Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 5 Quiz" className="mt-1" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={5} max={180} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-card rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Question {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Marks:</Label>
                    <Input type="number" min={1} max={10} value={q.marks} onChange={(e) => updateQuestion(idx, "marks", Number(e.target.value))} className="w-16 h-8 text-xs" />
                  </div>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)} className="text-destructive h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <Input value={q.question} onChange={(e) => updateQuestion(idx, "question", e.target.value)} placeholder="Enter your question" />

              <div className="grid grid-cols-2 gap-2">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const field = `option_${opt.toLowerCase()}` as keyof ManualQuestion;
                  return (
                    <div key={opt} className="relative">
                      <Input
                        value={q[field] as string}
                        onChange={(e) => updateQuestion(idx, field, e.target.value)}
                        placeholder={`Option ${opt}`}
                        className={q.correct_option === opt ? "border-emerald bg-emerald/5" : ""}
                      />
                      <button
                        onClick={() => updateQuestion(idx, "correct_option", opt)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                          q.correct_option === opt ? "bg-emerald text-white" : "bg-muted text-muted-foreground hover:bg-emerald/20"
                        }`}
                      >
                        {q.correct_option === opt ? "✓" : opt}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-navy text-white border-0 hover:opacity-90 font-bold">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save Test ({questions.length} Q · {questions.reduce((s, q) => s + q.marks, 0)} marks)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManualTestCreator;
