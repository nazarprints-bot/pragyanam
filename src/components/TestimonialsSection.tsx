import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: t("testimonials.name1"),
      role: t("testimonials.role1"),
      text: t("testimonials.text1"),
      avatar: "R",
      color: "bg-accent",
    },
    {
      name: t("testimonials.name2"),
      role: t("testimonials.role2"),
      text: t("testimonials.text2"),
      avatar: "P",
      color: "bg-primary",
    },
    {
      name: t("testimonials.name3"),
      role: t("testimonials.role3"),
      text: t("testimonials.text3"),
      avatar: "A",
      color: "bg-emerald",
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-cream dark:bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-14"
        >
          <p className="text-[11px] sm:text-[12px] font-semibold text-accent uppercase tracking-widest mb-2 sm:mb-3">
            {t("testimonials.label")}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">
            {t("testimonials.title")}
          </h2>
          <p className="text-[13px] sm:text-[15px] text-muted-foreground max-w-md mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-background rounded-xl p-5 sm:p-6 border border-border shadow-card hover:shadow-elevated transition-all duration-300 card-3d-subtle"
            >
              <Quote className="w-6 h-6 text-accent/30 mb-3" />
              <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed mb-5">
                "{item.text}"
              </p>
              <div className="flex items-center gap-2.5 mt-auto">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-primary-foreground text-[11px] font-bold`}>
                  {item.avatar}
                </div>
                <div>
                  <div className="text-[12px] sm:text-[13px] font-semibold text-foreground">{item.name}</div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground">{item.role}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mt-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-accent text-accent" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Success Stories Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 sm:mt-16 gradient-navy rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto"
        >
          <h3 className="text-lg sm:text-xl font-bold text-primary-foreground text-center mb-6 sm:mb-8">
            {t("testimonials.successTitle")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { value: "5,000+", label: t("testimonials.stat1") },
              { value: "95%", label: t("testimonials.stat2") },
              { value: "₹299", label: t("testimonials.stat3") },
              { value: "50+", label: t("testimonials.stat4") },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-xl sm:text-3xl font-extrabold text-accent tracking-tight">{stat.value}</div>
                <div className="text-[10px] sm:text-[12px] text-primary-foreground/70 font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
