import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Check, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlanSelectionProps {
  onSelect: (plan: "paid" | "free") => void;
  loading: boolean;
}

const PlanSelection = ({ onSelect, loading }: PlanSelectionProps) => {
  const [selected, setSelected] = useState<"paid" | "free" | null>(null);
  const { language } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">
          {isHi ? "अपना प्लान चुनें" : "Choose Your Plan"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi ? "7 दिन फ्री ट्रायल — कोई पेमेंट नहीं!" : "7-day free trial — no payment needed!"}
        </p>
      </div>

      <div className="space-y-3">
        {/* Paid Plan */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("paid")}
          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
            selected === "paid"
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-border hover:border-primary/30"
          }`}
        >
          {/* Recommended badge */}
          <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {isHi ? "अनुशंसित" : "Recommended"}
          </div>

          <div className="flex items-start gap-3 mt-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {isHi ? "प्रीमियम प्लान" : "Premium Plan"}
                </h3>
                <p className="text-lg font-extrabold text-primary">₹299<span className="text-[10px] font-normal text-muted-foreground">/{isHi ? "महीना" : "mo"}</span></p>
              </div>
              <div className="mt-2 space-y-1.5">
                {[
                  isHi ? "🎥 सभी वीडियो लेक्चर्स" : "🎥 All video lectures",
                  isHi ? "📝 सभी टेस्ट और क्विज़" : "📝 All tests & quizzes",
                  isHi ? "📚 लाइव क्लासेज एक्सेस" : "📚 Live classes access",
                  isHi ? "💬 डाउट सपोर्ट" : "💬 Doubt support",
                  isHi ? "📜 सर्टिफिकेट" : "📜 Certificates",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 bg-emerald-500/10 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-[11px] font-medium text-emerald-700">
                  {isHi ? "7 दिन फ्री ट्रायल — बिना कोई पेमेंट!" : "7-day FREE trial — no payment!"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Free Plan */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("free")}
          className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
            selected === "free"
              ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10"
              : "border-border hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  {isHi ? "मुफ़्त प्लान" : "Free Plan"}
                </h3>
                <p className="text-lg font-extrabold text-amber-600">{isHi ? "मुफ़्त" : "FREE"}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isHi
                  ? "एडमिन अप्रूवल ज़रूरी है। ज़रूरतमंद छात्रों के लिए।"
                  : "Admin approval required. For financially needy students."}
              </p>
              <div className="mt-2 flex items-center gap-1.5 bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-[11px] font-medium text-amber-700">
                  {isHi ? "⏳ अप्रूवल के बाद एक्सेस मिलेगा" : "⏳ Access after admin approval"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Button
        disabled={!selected || loading}
        onClick={() => selected && onSelect(selected)}
        className="w-full h-10 text-sm font-semibold gradient-navy text-white hover:opacity-90"
      >
        {loading
          ? (isHi ? "कृपया प्रतीक्षा करें..." : "Please wait...")
          : selected === "paid"
            ? (isHi ? "7 दिन फ्री ट्रायल शुरू करें" : "Start 7-Day Free Trial")
            : selected === "free"
              ? (isHi ? "मुफ़्त एक्सेस के लिए आवेदन करें" : "Apply for Free Access")
              : (isHi ? "प्लान चुनें" : "Select a Plan")}
      </Button>
    </div>
  );
};

export default PlanSelection;
