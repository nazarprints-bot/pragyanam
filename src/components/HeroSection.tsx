import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedCounter from "@/components/AnimatedCounter";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-cream to-background pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-accent/8 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/5 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-5 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[11px] sm:text-[12px] font-semibold text-primary mb-6 sm:mb-8">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
              {t("hero.badge")}
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-[3.75rem] font-extrabold text-foreground leading-[1.1] tracking-tight mb-4 sm:mb-5">
            {t("hero.title1")}
            <span className="text-gradient-gold">{t("hero.titleHighlight")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[13px] sm:text-[15px] text-muted-foreground leading-relaxed mb-7 sm:mb-10 max-w-xl mx-auto px-2">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center mb-10 sm:mb-16 px-4 sm:px-0">
            <Link to="/auth">
              <Button size="lg" className="h-10 sm:h-12 px-5 sm:px-7 text-[13px] sm:text-[14px] font-semibold gradient-navy text-primary-foreground hover:opacity-90 rounded-xl shadow-elevated w-full sm:w-auto">
                {t("hero.cta1")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-10 sm:h-12 px-5 sm:px-7 text-[13px] sm:text-[14px] font-semibold rounded-xl border-primary/20 text-primary hover:bg-primary/5 w-full sm:w-auto">
                {t("hero.cta2")}
              </Button>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-14">
            <AnimatedCounter end={5000} suffix="+" label={t("hero.students")} />
            <AnimatedCounter end={20} suffix="+" label={t("hero.coursesCount")} />
            <AnimatedCounter end={95} suffix="%" label={t("hero.passRate")} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
