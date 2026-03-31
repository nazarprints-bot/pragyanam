import { motion } from "framer-motion";
import { Check, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t("pricing.pro"), price: "₹299", period: "/mo",
      desc: t("pricing.proDesc"),
      features: [t("pricing.f.liveClasses"), t("pricing.f.recordedLectures"), t("pricing.f.pdfStudyMaterial"), t("pricing.f.mockExams"), t("pricing.f.priorityDoubt"), t("pricing.f.progressAnalytics"), t("pricing.f.competitivePrep")],
      popular: true, cta: t("pricing.getStarted"),
    },
    {
      name: t("pricing.free"), price: "₹0", period: "",
      desc: t("pricing.freeDesc"),
      features: [t("pricing.f.fullAccess"), t("pricing.f.adminApproval"), t("pricing.f.community"), t("pricing.f.noCompromise")],
      popular: false, cta: t("pricing.applyNow"), isFree: true,
    },
  ];

  return (
    <section id="pricing" className="py-14 sm:py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
          <p className="text-[11px] sm:text-[12px] font-semibold text-accent uppercase tracking-widest mb-2 sm:mb-3">{t("pricing.label")}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">{t("pricing.title")}</h2>
          <p className="text-[13px] sm:text-[15px] text-muted-foreground max-w-md mx-auto">{t("pricing.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`relative bg-background rounded-xl p-5 sm:p-7 border transition-all duration-200 ${plan.popular ? "border-accent shadow-glow sm:scale-[1.02]" : "border-border hover:shadow-card"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-gold text-foreground text-[10px] sm:text-[11px] font-bold px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
                  {t("pricing.mostPopular")}
                </div>
              )}
              {plan.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-primary-foreground text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Heart className="w-3 h-3" /> {t("pricing.socialImpact")}
                </div>
              )}
              <div className="mb-3 sm:mb-5"><h3 className="text-[14px] sm:text-[16px] font-bold text-foreground">{plan.name}</h3></div>
              <div className="mb-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                <span className="text-[12px] sm:text-[13px] text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-muted-foreground mb-4 sm:mb-5">{plan.desc}</p>
              <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] text-foreground">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className={`w-full h-9 sm:h-10 text-[12px] sm:text-[13px] font-semibold rounded-lg ${plan.popular ? "gradient-navy text-primary-foreground hover:opacity-90" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
