import { motion } from "framer-motion";
import {
  Video, FileText, Brain, MessageCircle, BarChart3, Globe, PlayCircle, BookOpen,
} from "lucide-react";

const features = [
  { icon: Video, title: "Live Classes", desc: "Interactive sessions with real-time doubt solving" },
  { icon: PlayCircle, title: "Recorded Lectures", desc: "Access video lectures anytime, organized chapter-wise" },
  { icon: FileText, title: "Study Material", desc: "PDF notes, practice sheets & chapter summaries" },
  { icon: Brain, title: "Smart Tests", desc: "Chapter tests, mock exams with instant results" },
  { icon: MessageCircle, title: "Doubt Solving", desc: "Post doubts and get teacher responses quickly" },
  { icon: BarChart3, title: "Progress Tracking", desc: "Track completion, scores & performance analytics" },
  { icon: Globe, title: "Multi-Language", desc: "Full bilingual support across the platform" },
  { icon: BookOpen, title: "All Subjects", desc: "Class 6–12, Govt Jobs & Scholarship prep" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 lg:py-28 gradient-navy relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[12px] font-semibold text-accent uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-[15px] text-primary-foreground/60 max-w-md mx-auto">
            All the tools for success in one place
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
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-primary-foreground/10 hover:border-accent/30 hover:bg-primary-foreground/8 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center mb-3">
                <feature.icon className="w-[18px] h-[18px] text-accent" />
              </div>
              <h3 className="text-[14px] font-semibold text-primary-foreground mb-1.5">{feature.title}</h3>
              <p className="text-[13px] text-primary-foreground/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
