import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const courses = [
  { title: "Class 6–8", desc: "Foundation building with strong basics", icon: "📘" },
  { title: "Class 9–10", desc: "Board exam preparation & concepts", icon: "📗" },
  { title: "Class 11–12", desc: "Advanced subjects & board prep", icon: "📕" },
  { title: "Police Exam", desc: "Complete preparation with mock tests", icon: "🛡️" },
  { title: "Army Exam", desc: "Physical & written exam preparation", icon: "⭐" },
  { title: "Scholarship", desc: "NTSE, Olympiad & state scholarship", icon: "🏆" },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="py-20 lg:py-28 bg-cream">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[12px] font-semibold text-accent uppercase tracking-widest mb-3">Courses</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Learn what matters
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-md mx-auto">
            From school to competitive exams — everything in one place
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group bg-background rounded-xl p-5 border border-border hover:border-accent/30 hover:shadow-gold cursor-pointer transition-all duration-300"
            >
              <div className="text-2xl mb-3">{course.icon}</div>
              <h3 className="text-[15px] font-semibold text-foreground mb-1.5">{course.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3">{course.desc}</p>
              <div className="flex items-center text-[12px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
