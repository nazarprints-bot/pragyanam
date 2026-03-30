import { motion } from "framer-motion";
import {
  Video, FileText, Brain, MessageCircle, BarChart3, Globe, PlayCircle, BookOpen,
} from "lucide-react";

const features = [
  { icon: Video, title: "Live Classes", titleHi: "लाइव कक्षाएं", desc: "Interactive sessions with real-time doubt solving" },
  { icon: PlayCircle, title: "Recorded Lectures", titleHi: "रिकॉर्डेड लेक्चर", desc: "Access video lectures anytime, organized chapter-wise" },
  { icon: FileText, title: "Study Material", titleHi: "अध्ययन सामग्री", desc: "PDF notes, practice sheets & chapter summaries" },
  { icon: Brain, title: "Smart Tests", titleHi: "स्मार्ट टेस्ट", desc: "Chapter tests, mock exams with instant results" },
  { icon: MessageCircle, title: "Doubt Solving", titleHi: "डाउट सॉल्विंग", desc: "Post doubts and get teacher responses quickly" },
  { icon: BarChart3, title: "Progress Tracking", titleHi: "प्रगति ट्रैकिंग", desc: "Track completion, scores & performance analytics" },
  { icon: Globe, title: "Hindi + English", titleHi: "बहु-भाषा", desc: "Full bilingual support across the platform" },
  { icon: BookOpen, title: "All Subjects", titleHi: "सभी विषय", desc: "Class 6–12, Govt Jobs & Scholarship prep" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-md mx-auto">
            सफलता के लिए सब कुछ एक ही जगह
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/15 hover:shadow-soft transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                <feature.icon className="w-[18px] h-[18px] text-accent-foreground" />
              </div>
              <h3 className="text-[14px] font-semibold text-foreground mb-0.5">{feature.title}</h3>
              <p className="text-[11px] font-medium text-primary mb-1.5">{feature.titleHi}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;