import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CoursesSection = () => {
  const { t } = useLanguage();

  const courses = [
    { title: t("courses.class68"), desc: t("courses.class68Desc"), icon: "📘" },
    { title: t("courses.class910"), desc: t("courses.class910Desc"), icon: "📗" },
    { title: t("courses.class1112"), desc: t("courses.class1112Desc"), icon: "📕" },
    { title: t("courses.police"), desc: t("courses.policeDesc"), icon: "🛡️" },
    { title: t("courses.army"), desc: t("courses.armyDesc"), icon: "⭐" },
    { title: t("courses.scholarship"), desc: t("courses.scholarshipDesc"), icon: "🏆" },
  ];

  return (
    <section id="courses" className="py-14 sm:py-20 lg:py-28 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
          <p className="text-[11px] sm:text-[12px] font-semibold text-accent uppercase tracking-widest mb-2 sm:mb-3">{t("courses.label")}</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">{t("courses.title")}</h2>
          <p className="text-[13px] sm:text-[15px] text-muted-foreground max-w-md mx-auto">{t("courses.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {courses.map((course, i) => (
            <motion.div key={course.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="group bg-background rounded-xl p-3.5 sm:p-5 border border-border hover:border-accent/30 hover:shadow-gold cursor-pointer transition-all duration-300">
              <div className="text-xl sm:text-2xl mb-2 sm:mb-3">{course.icon}</div>
              <h3 className="text-[13px] sm:text-[15px] font-semibold text-foreground mb-1 sm:mb-1.5 line-clamp-2">{course.title}</h3>
              <p className="text-[11px] sm:text-[13px] text-muted-foreground leading-relaxed mb-2 sm:mb-3 line-clamp-2">{course.desc}</p>
              <div className="flex items-center text-[11px] sm:text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {t("courses.explore")} <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
