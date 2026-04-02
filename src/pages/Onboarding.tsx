import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Brain, Target, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

const subjects = [
  { id: "math", label: "Mathematics", labelHi: "गणित", icon: "📐" },
  { id: "science", label: "Science", labelHi: "विज्ञान", icon: "🔬" },
  { id: "english", label: "English", labelHi: "अंग्रेज़ी", icon: "📖" },
  { id: "hindi", label: "Hindi", labelHi: "हिंदी", icon: "📝" },
  { id: "social", label: "Social Studies", labelHi: "सामाजिक विज्ञान", icon: "🌍" },
  { id: "computer", label: "Computer", labelHi: "कंप्यूटर", icon: "💻" },
  { id: "gk", label: "General Knowledge", labelHi: "सामान्य ज्ञान", icon: "🧠" },
  { id: "reasoning", label: "Reasoning", labelHi: "रीज़निंग", icon: "🧩" },
];

const goals = [
  { id: "30", label: "30 min/day", labelHi: "30 मिनट/दिन", icon: "⏱️" },
  { id: "60", label: "1 hour/day", labelHi: "1 घंटा/दिन", icon: "🕐" },
  { id: "120", label: "2 hours/day", labelHi: "2 घंटे/दिन", icon: "📚" },
  { id: "180", label: "3+ hours/day", labelHi: "3+ घंटे/दिन", icon: "🔥" },
];

const Onboarding = () => {
  const { user, refetchProfile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const isHi = language === "hi";

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error(isHi ? "कुछ गलत हुआ" : "Something went wrong");
    } else {
      await refetchProfile();
      toast.success(isHi ? "स्वागत है! 🎉" : "Welcome aboard! 🎉");
    }
    setSaving(false);
    navigate("/dashboard", { replace: true });
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex flex-col items-center text-center space-y-6 animate-slide-up">
      <div className="w-20 h-20 rounded-2xl gradient-navy flex items-center justify-center animate-glow-pulse">
        <GraduationCap className="w-10 h-10 text-gold" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
          {isHi ? "प्रज्ञानम् में आपका स्वागत है! 🎉" : "Welcome to Pragyanam! 🎉"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-md mx-auto">
          {isHi
            ? "आइए आपकी पढ़ाई को पर्सनलाइज़ करें। बस 2 छोटे स्टेप्स!"
            : "Let's personalize your learning experience. Just 2 quick steps!"}
        </p>
      </div>
      <Button onClick={() => setStep(1)} size="lg" className="gradient-navy text-white border-0 hover:opacity-90 gap-2 text-base px-8">
        {isHi ? "शुरू करें" : "Let's Go"} <ChevronRight className="w-5 h-5" />
      </Button>
    </div>,

    // Step 1: Choose subjects
    <div key="subjects" className="space-y-5 animate-slide-up">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary">{isHi ? "स्टेप 1/2" : "STEP 1/2"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
          {isHi ? "आपकी रुचि किसमें है?" : "What interests you?"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isHi ? "अपने पसंदीदा विषय चुनें (एक या अधिक)" : "Pick your favorite subjects (one or more)"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSubject(s.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${
              selectedSubjects.includes(s.id)
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <span className="text-xl">{s.icon}</span>
            <span className="font-semibold text-foreground text-sm">{isHi ? s.labelHi : s.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 justify-center pt-2">
        <Button variant="outline" onClick={() => setStep(0)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {isHi ? "पीछे" : "Back"}
        </Button>
        <Button
          onClick={() => setStep(2)}
          disabled={selectedSubjects.length === 0}
          className="gradient-navy text-white border-0 hover:opacity-90 gap-1"
        >
          {isHi ? "अगला" : "Next"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>,

    // Step 2: Daily goal
    <div key="goal" className="space-y-5 animate-slide-up">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary">{isHi ? "स्टेप 2/2" : "STEP 2/2"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
          {isHi ? "रोज़ कितना पढ़ेंगे?" : "Set your daily goal"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isHi ? "अपना रोज़ का पढ़ाई का लक्ष्य चुनें" : "How much time can you study each day?"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        {goals.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGoal(g.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${
              selectedGoal === g.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <span className="text-2xl">{g.icon}</span>
            <span className="font-semibold text-foreground text-sm">{isHi ? g.labelHi : g.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 justify-center pt-2">
        <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> {isHi ? "पीछे" : "Back"}
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!selectedGoal || saving}
          className="gradient-navy text-white border-0 hover:opacity-90 gap-1 px-6"
        >
          <Sparkles className="w-4 h-4" />
          {saving ? (isHi ? "सेव हो रहा है..." : "Saving...") : (isHi ? "शुरू करें!" : "Start Learning!")}
        </Button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {steps[step]}
        {step > 0 && (
          <button
            onClick={handleComplete}
            className="block mx-auto mt-6 text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {isHi ? "बाद में करें →" : "Skip for now →"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
