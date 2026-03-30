import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center pt-16">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-background to-background pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-saffron-light/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-[12px] font-medium text-accent-foreground mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              India's most affordable learning platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-4"
          >
            Quality education for{" "}
            <span className="text-gradient-hero">every student</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-base text-primary font-medium mb-1"
          >
            हर छात्र के लिए गुणवत्तापूर्ण शिक्षा
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Class 6–12, competitive exams, scholarships — live classes, smart tests, 
            and doubt solving. All at the lowest price.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <Link to="/auth">
              <Button size="lg" className="h-11 px-6 text-[14px] font-medium bg-foreground text-background hover:bg-foreground/90 rounded-lg shadow-card">
                Start learning free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-11 px-6 text-[14px] font-medium rounded-lg border-border">
                See how it works
              </Button>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: "5,000+", label: "Students" },
              { value: "20+", label: "Courses" },
              { value: "95%", label: "Pass Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;