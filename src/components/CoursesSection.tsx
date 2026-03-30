import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const courses = [
  { title: "Class 6–8", titleHi: "कक्षा 6–8", desc: "Foundation building with strong basics", icon: "📘", count: "120+ Videos" },
  { title: "Class 9–10", titleHi: "कक्षा 9–10", desc: "Board exam preparation & concepts", icon: "📗", count: "200+ Videos" },
  { title: "Class 11–12", titleHi: "कक्षा 11–12", desc: "Advanced subjects & board prep", icon: "📕", count: "300+ Videos" },
  { title: "Police Exam", titleHi: "पुलिस परीक्षा", desc: "Complete preparation with mock tests", icon: "🛡️", count: "150+ Videos" },
  { title: "Army Exam", titleHi: "आर्मी परीक्षा", desc: "Physical & written exam preparation", icon: "⭐", count: "180+ Videos" },
  { title: "Scholarship", titleHi: "छात्रवृत्ति", desc: "NTSE, Olympiad & state scholarship", icon: "🏆", count: "100+ Videos" },
];

const CoursesSection = () => {
  return (
    <section id="courses" className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Courses / कोर्स
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground mt-3 mb-4">
            Learn What <span className="text-gradient-saffron">Matters</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            School से लेकर competitive exams तक — सब कुछ एक जगह
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {courses.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card rounded-2xl p-6 border border-border hover:shadow-card hover:border-primary/20 cursor-pointer transition-all duration-300"
            >
              <div className="text-4xl mb-4">{course.icon}</div>
              <h3 className="text-xl font-bold font-heading text-foreground mb-0.5">{course.title}</h3>
              <p className="text-sm text-primary mb-2">{course.titleHi}</p>
              <p className="text-sm text-muted-foreground mb-4">{course.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {course.count}
                </span>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
