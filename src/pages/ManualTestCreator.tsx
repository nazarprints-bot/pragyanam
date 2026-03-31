import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, Save, Loader2, Brain, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type QuestionType = "mcq" | "short" | "long";

interface ManualQuestion {
  question_type: QuestionType;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  answer_text: string;
  marks: number;
}

const emptyQuestion = (type: QuestionType = "mcq"): ManualQuestion => ({
  question_type: type,
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  answer_text: "",
  marks: type === "long" ? 5 : type === "short" ? 2 : 1,
});

const typeLabels: Record<QuestionType, string> = {
  mcq: "MCQ",
  short: "Short Answer",
  long: "Long Answer",
};

const ManualTestCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<ManualQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishNow, setPublishNow] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      const { data } = await supabase.from("courses").select("id, title").eq("created_by", user.id);
      setCourses(data || []);
    };
    fetchCourses();
  }, [user]);

  const addQuestion = (type: QuestionType) => setQuestions([...questions, emptyQuestion(type)]);

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
      if (!q.question.trim()) { toast.error(`Question ${i + 1} is empty`); return; }
      if (q.question_type === "mcq" && (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim())) {
        toast.error(`Question ${i + 1}: All 4 options are required for MCQ`); return;
      }
    }

    setSaving(true);
    try {
      const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
      const isScheduled = !publishNow && scheduledAt;

      const insertData: any = {
        title,
        title_hi: "",
        type: "chapter",
        total_marks: totalMarks,
        duration_minutes: duration,
        is_published: publishNow,
        created_by: user.id,
        course_id: selectedCourse || null,
      };

      if (isScheduled) {
        insertData.scheduled_at = new Date(scheduledAt).toISOString();
        insertData.is_published = false;
      }

      const { data: test, error: testErr } = await supabase
        .from("tests").insert(insertData).select().single();
      if (testErr) throw testErr;

      const qInsert = questions.map((q, i) => ({
        test_id: test.id,
        question: q.question,
        question_type: q.question_type,
        option_a: q.question_type === "mcq" ? q.option_a : "",
        option_b: q.question_type === "mcq" ? q.option_b : "",
        option_c: q.question_type === "mcq" ? q.option_c : "",
        option_d: q.question_type === "mcq" ? q.option_d : "",
        correct_option: q.question_type === "mcq" ? q.correct_option : "",
        answer_text: q.question_type !== "mcq" ? q.answer_text : null,
        marks: q.marks,
        sort_order: i + 1,
      }));

      const { error: qErr } = await supabase.from("test_questions").insert(qInsert);
      if (qErr) throw qErr;

      toast.success(isScheduled
        ? `Test scheduled for ${new Date(scheduledAt).toLocaleDateString("en-IN")}!`
        : "Test created successfully!"
      );
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
              <Brain className="w-6 h-6 text-primary" />
              Create Test / टेस्ट बनाएं
            </h1>
            <p className="text-sm text-muted-foreground">MCQ, Short Answer & Long Answer questions</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard/ai-test")}>
            <Sparkles className="w-4 h-4 mr-1" /> AI Help
          </Button>
        </div>

        {/* Test Info */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Test Title / टेस्ट का नाम</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Test - March" className="mt-1" />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min={5} max={180} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Course (Optional) / कोर्स</Label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">-- No Course (General Test) --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Publish / प्रकाशन</Label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setPublishNow(true)}
                  className={`flex-1 text-xs py-2 px-3 rounded-lg border transition-colors ${
                    publishNow ? "border-primary bg-primary/10 font-bold text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  Publish Now
                </button>
                <button
                  onClick={() => setPublishNow(false)}
                  className={`flex-1 text-xs py-2 px-3 rounded-lg border transition-colors ${
                    !publishNow ? "border-primary bg-primary/10 font-bold text-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  <Calendar className="w-3 h-3 inline mr-1" /> Schedule
                </button>
              </div>
            </div>
          </div>

          {!publishNow && (
            <div>
              <Label>Schedule Date & Time / तारीख और समय</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 max-w-xs"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Test will auto-publish on this date / इस तारीख को टेस्ट अपने आप publish हो जाएगा
              </p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-card rounded-2xl p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Q{idx + 1}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    q.question_type === "mcq" ? "bg-primary/10 text-primary"
                    : q.question_type === "short" ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {typeLabels[q.question_type]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Marks:</Label>
                    <Input type="number" min={1} max={20} value={q.marks} onChange={(e) => updateQuestion(idx, "marks", Number(e.target.value))} className="w-16 h-8 text-xs" />
                  </div>
                  {questions.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)} className="text-destructive h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Question type selector */}
              <div className="flex gap-2">
                {(["mcq", "short", "long"] as QuestionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateQuestion(idx, "question_type", type)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      q.question_type === type
                        ? "border-primary bg-primary/10 font-bold text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>

              {/* Question text */}
              <Textarea
                value={q.question}
                onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                placeholder="Enter your question / प्रश्न लिखें"
                className="min-h-[60px]"
              />

              {/* MCQ Options */}
              {q.question_type === "mcq" && (
                <div className="grid grid-cols-2 gap-2">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const field = `option_${opt.toLowerCase()}` as keyof ManualQuestion;
                    return (
                      <div key={opt} className="relative">
                        <Input
                          value={q[field] as string}
                          onChange={(e) => updateQuestion(idx, field, e.target.value)}
                          placeholder={`Option ${opt}`}
                          className={q.correct_option === opt ? "border-primary bg-primary/5" : ""}
                        />
                        <button
                          onClick={() => updateQuestion(idx, "correct_option", opt)}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                            q.correct_option === opt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20"
                          }`}
                        >
                          {q.correct_option === opt ? "✓" : opt}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short/Long answer */}
              {q.question_type !== "mcq" && (
                <div>
                  <Label className="text-xs text-muted-foreground">Expected Answer (reference) / अपेक्षित उत्तर</Label>
                  <Textarea
                    value={q.answer_text}
                    onChange={(e) => updateQuestion(idx, "answer_text", e.target.value)}
                    placeholder={q.question_type === "short" ? "Expected short answer..." : "Expected detailed answer..."}
                    className={q.question_type === "long" ? "min-h-[120px] mt-1" : "min-h-[60px] mt-1"}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => addQuestion("mcq")}>
            <Plus className="w-4 h-4 mr-1" /> MCQ
          </Button>
          <Button variant="outline" onClick={() => addQuestion("short")}>
            <Plus className="w-4 h-4 mr-1" /> Short
          </Button>
          <Button variant="outline" onClick={() => addQuestion("long")}>
            <Plus className="w-4 h-4 mr-1" /> Long
          </Button>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            {publishNow ? "Save & Publish" : "Save & Schedule"} ({questions.length} Q · {questions.reduce((s, q) => s + q.marks, 0)} marks)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManualTestCreator;
