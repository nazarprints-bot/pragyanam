import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-cream to-background pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/6 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[12px] font-semibold text-primary mb-8">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              {t("hero.badge")}
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-foreground leading-[1.08] tracking-tight mb-5">
            {t("hero.title1")}
            <span className="text-gradient-gold">{t("hero.titleHighlight")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-7 text-[14px] font-semibold gradient-navy text-primary-foreground hover:opacity-90 rounded-xl shadow-elevated">
                {t("hero.cta1")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-7 text-[14px] font-semibold rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                {t("hero.cta2")}
              </Button>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center justify-center gap-10 sm:gap-14">
            {[
              { value: "5,000+", label: t("hero.students") },
              { value: "20+", label: t("hero.coursesCount") },
              { value: "95%", label: t("hero.passRate") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-[12px] text-muted-foreground font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
