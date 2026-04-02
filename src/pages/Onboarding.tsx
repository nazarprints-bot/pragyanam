import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Brain, Target, ChevronRight, ChevronLeft, Sparkles, Rocket, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const subjects = [
  { id: "math", label: "Mathematics", labelHi: "गणित", icon: "📐", color: "from-blue-500/20 to-indigo-500/20" },
  { id: "science", label: "Science", labelHi: "विज्ञान", icon: "🔬", color: "from-emerald-500/20 to-teal-500/20" },
  { id: "english", label: "English", labelHi: "अंग्रेज़ी", icon: "📖", color: "from-amber-500/20 to-orange-500/20" },
  { id: "hindi", label: "Hindi", labelHi: "हिंदी", icon: "📝", color: "from-red-500/20 to-rose-500/20" },
  { id: "social", label: "Social Studies", labelHi: "सामाजिक विज्ञान", icon: "🌍", color: "from-cyan-500/20 to-sky-500/20" },
  { id: "computer", label: "Computer", labelHi: "कंप्यूटर", icon: "💻", color: "from-violet-500/20 to-purple-500/20" },
  { id: "gk", label: "General Knowledge", labelHi: "सामान्य ज्ञान", icon: "🧠", color: "from-pink-500/20 to-fuchsia-500/20" },
  { id: "reasoning", label: "Reasoning", labelHi: "रीज़निंग", icon: "🧩", color: "from-yellow-500/20 to-lime-500/20" },
];

const goals = [
  { id: "30", label: "30 min/day", labelHi: "30 मिनट/दिन", icon: "⏱️", desc: "Light & Easy", descHi: "हल्का और आसान" },
  { id: "60", label: "1 hour/day", labelHi: "1 घंटा/दिन", icon: "🕐", desc: "Balanced", descHi: "संतुलित" },
  { id: "120", label: "2 hours/day", labelHi: "2 घंटे/दिन", icon: "📚", desc: "Focused", descHi: "केंद्रित" },
  { id: "180", label: "3+ hours/day", labelHi: "3+ घंटे/दिन", icon: "🔥", desc: "Intense", descHi: "गहन" },
];

const features = [
  { icon: "📹", label: "Live Classes", labelHi: "लाइव कक्षाएं" },
  { icon: "📚", label: "Video Lectures", labelHi: "वीडियो लेक्चर" },
  { icon: "📝", label: "AI Tests", labelHi: "AI टेस्ट" },
  { icon: "🏆", label: "Certificates", labelHi: "प्रमाणपत्र" },
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
      toast.success(isHi ? "🎉 स्वागत है! अब पढ़ाई शुरू करें!" : "🎉 Welcome! Let's start learning!");
    }
    setSaving(false);
    navigate("/dashboard", { replace: true });
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(0);

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const progressWidth = `${((step) / 2) * 100}%`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center text-center space-y-8"
              >
                {/* Animated logo */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20">
                    <GraduationCap className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground leading-tight">
                    {isHi ? "प्रज्ञानम् में" : "Welcome to"}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {isHi ? "आपका स्वागत है! 🎉" : "Pragyanam! 🎉"}
                    </span>
                  </h1>
                  <p className="text-muted-foreground mt-3 text-base max-w-sm mx-auto">
                    {isHi
                      ? "भारत का सबसे बेहतर शिक्षा मंच। आइए शुरू करें!"
                      : "India's best education platform. Let's personalize your experience!"}
                  </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {features.map((f, i) => (
                    <motion.div
                      key={f.icon}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex items-center gap-1.5 bg-muted/80 border border-border px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
                    >
                      <span>{f.icon}</span>
                      <span>{isHi ? f.labelHi : f.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button onClick={goNext} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base px-8 rounded-xl shadow-lg shadow-primary/20 h-12">
                    <Rocket className="w-5 h-5" />
                    {isHi ? "शुरू करें" : "Let's Go"}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="subjects"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <BookOpen className="w-3.5 h-3.5" />
                    {isHi ? "स्टेप 1/2" : "STEP 1 OF 2"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                    {isHi ? "आपकी रुचि किसमें है?" : "What interests you?"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {isHi ? "अपने पसंदीदा विषय चुनें (एक या अधिक)" : "Pick your favorite subjects (one or more)"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {subjects.map((s, i) => {
                    const selected = selectedSubjects.includes(s.id);
                    return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => toggleSubject(s.id)}
                        className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] text-left overflow-hidden ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                        <span className="text-2xl">{s.icon}</span>
                        <span className="font-semibold text-foreground text-sm">{isHi ? s.labelHi : s.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <Button variant="outline" onClick={goBack} className="gap-1 rounded-xl h-11">
                    <ChevronLeft className="w-4 h-4" /> {isHi ? "पीछे" : "Back"}
                  </Button>
                  <Button
                    onClick={goNext}
                    disabled={selectedSubjects.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-xl h-11 px-6"
                  >
                    {isHi ? "अगला" : "Next"} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {selectedSubjects.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-primary font-medium"
                  >
                    {selectedSubjects.length} {isHi ? "विषय चुने गए" : "subjects selected"} ✓
                  </motion.p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="goal"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    <Target className="w-3.5 h-3.5" />
                    {isHi ? "स्टेप 2/2" : "STEP 2 OF 2"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                    {isHi ? "रोज़ कितना पढ़ेंगे?" : "Set your daily goal"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {isHi ? "अपना रोज़ का पढ़ाई का लक्ष्य चुनें" : "How much time can you study each day?"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {goals.map((g, i) => {
                    const selected = selectedGoal === g.id;
                    return (
                      <motion.button
                        key={g.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setSelectedGoal(g.id)}
                        className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] text-left ${
                          selected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                        }`}
                      >
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                        <span className="text-3xl">{g.icon}</span>
                        <div>
                          <span className="font-bold text-foreground text-sm block">{isHi ? g.labelHi : g.label}</span>
                          <span className="text-[11px] text-muted-foreground">{isHi ? g.descHi : g.desc}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <Button variant="outline" onClick={goBack} className="gap-1 rounded-xl h-11">
                    <ChevronLeft className="w-4 h-4" /> {isHi ? "पीछे" : "Back"}
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!selectedGoal || saving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-11 px-8 shadow-lg shadow-primary/20"
                  >
                    <Zap className="w-4 h-4" />
                    {saving ? (isHi ? "सेव हो रहा है..." : "Saving...") : (isHi ? "शुरू करें!" : "Start Learning!")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip link */}
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleComplete}
              className="block mx-auto mt-8 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isHi ? "बाद में करें →" : "Skip for now →"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
