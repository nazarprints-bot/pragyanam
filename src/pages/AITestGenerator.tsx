import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Sparkles, FileText, Loader2, Save, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface GeneratedQuestion {
  question: string;
  question_hi: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
}

interface Course {
  id: string;
  title: string;
}

const AITestGenerator = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"topic" | "notes">("topic");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [testTitle, setTestTitle] = useState("");
  const [testTitleHi, setTestTitleHi] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");

  useEffect(() => {
    if (user) {
      supabase
        .from("courses")
        .select("id, title")
        .eq("created_by", user.id)
        .then(({ data }) => {
          if (data) setCourses(data);
        });
    }
  }, [user]);

  const handleGenerate = async () => {
    if (mode === "topic" && !topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    if (mode === "notes" && !notes.trim()) {
      toast.error("Please paste your notes");
      return;
    }

    setGenerating(true);
    setQuestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-test", {
        body: {
          topic: mode === "topic" ? topic : undefined,
          notes: mode === "notes" ? notes : undefined,
          numQuestions,
          language: "bilingual",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setQuestions(data.questions || []);
      toast.success(`${data.questions?.length || 0} questions generated!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTest = async () => {
    if (!testTitle.trim()) {
      toast.error("Please enter a test title");
      return;
    }
    if (!user || questions.length === 0) return;

    let scheduledAt: string | null = null;
    if (scheduledDate) {
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const dt = new Date(scheduledDate);
      dt.setHours(hours, minutes, 0, 0);
      scheduledAt = dt.toISOString();
    }

    setSaving(true);
    try {
      const { data: test, error: testError } = await supabase
        .from("tests")
        .insert({
          title: testTitle,
          title_hi: testTitleHi || "",
          type: "chapter",
          total_marks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          duration_minutes: Math.max(questions.length * 2, 10),
          is_published: !scheduledAt,
          created_by: user.id,
          course_id: selectedCourse || null,
          scheduled_at: scheduledAt,
        })
        .select()
        .single();

      if (testError) throw testError;

      const questionsToInsert = questions.map((q, i) => ({
        test_id: test.id,
        question: q.question,
        question_hi: q.question_hi,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        marks: q.marks || 1,
        sort_order: i + 1,
      }));

      const { error: qError } = await supabase.from("test_questions").insert(questionsToInsert);
      if (qError) throw qError;

      toast.success(
        scheduledAt
          ? `Test scheduled for ${format(new Date(scheduledAt), "PPP p")}!`
          : "Test saved & published!"
      );
      setQuestions([]);
      setTestTitle("");
      setTestTitleHi("");
      setTopic("");
      setNotes("");
      setSelectedCourse("");
      setScheduledDate(undefined);
    } catch (err: any) {
      toast.error(err.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            AI Test Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate MCQ tests using AI from a topic or your notes
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => setMode("topic")}
              className={`flex-1 p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === "topic"
                  ? "border-gold bg-gold/10 text-gold-warm"
                  : "border-border text-muted-foreground hover:border-gold/30"
              }`}
            >
              <Brain className="w-4 h-4" />
              Generate from Topic
            </button>
            <button
              onClick={() => setMode("notes")}
              className={`flex-1 p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === "notes"
                  ? "border-gold bg-gold/10 text-gold-warm"
                  : "border-border text-muted-foreground hover:border-gold/30"
              }`}
            >
              <FileText className="w-4 h-4" />
              Generate from Notes
            </button>
          </div>

          {mode === "topic" ? (
            <div>
              <Label>Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Quadratic Equations, Indian Freedom Movement"
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label>Paste Notes / Content</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your study material, notes, or textbook content here..."
                className="mt-1 min-h-[200px]"
              />
            </div>
          )}

          <div>
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min={5}
              max={30}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="mt-1 w-32"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gradient-navy text-white border-0 hover:opacity-90 font-bold"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </div>

        {/* Generated Questions Preview */}
        {questions.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-gold" />
              Generated Questions ({questions.length})
            </h2>

            {/* Save Test Form */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Test Title</Label>
                  <Input
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g. Chapter 5 Test"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subtitle (Optional)</Label>
                  <Input
                    value={testTitleHi}
                    onChange={(e) => setTestTitleHi(e.target.value)}
                    placeholder="Optional subtitle"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <Label>Link to Course (Optional)</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No course</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Schedule Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full mt-1 justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Schedule Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {scheduledDate && (
                <p className="text-xs text-muted-foreground">
                  Test will auto-publish on {format(scheduledDate, "PPP")} at {scheduledTime}
                </p>
              )}

              <Button
                onClick={handleSaveTest}
                disabled={saving || !testTitle.trim()}
                className="gradient-gold text-navy-dark font-bold hover:opacity-90"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {scheduledDate ? "Schedule Test" : "Save & Publish"}
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {questions.map((q, i) => (
                <div key={i} className="bg-background rounded-xl p-4 border border-border">
                  <p className="font-medium text-foreground text-sm mb-2">
                    Q{i + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["A", "B", "C", "D"].map((opt) => {
                      const key = `option_${opt.toLowerCase()}` as keyof GeneratedQuestion;
                      const isCorrect = q.correct_option === opt;
                      return (
                        <div
                          key={opt}
                          className={`text-xs px-3 py-2 rounded-lg border ${
                            isCorrect
                              ? "border-emerald bg-emerald/10 text-foreground font-medium"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold mr-1">{opt}.</span>
                          {q[key] as string}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AITestGenerator;
