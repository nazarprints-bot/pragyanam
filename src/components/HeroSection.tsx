import { motion } from "framer-motion";
import { Play, ArrowRight, Users, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-students.jpg";

const stats = [
  { icon: Users, value: "5000+", label: "Students / छात्र READY TO USE" },
  { icon: BookOpen, value: "20+", label: "Courses / कोर्स" },
  { icon: Trophy, value: "95%", label: "Results / परिणाम" },
];

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(24_95%_53%_/_0.15),_transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-light border border-primary/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-accent-foreground">
                🇮🇳 India's Most Affordable EdTech
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-heading text-secondary-foreground leading-[1.1] mb-4">
              <span className="text-primary-foreground">Quality Education</span>
              <br />
              <span className="text-gradient-saffron">For Every Student</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/70 mb-3 font-heading">
              हर छात्र के लिए गुणवत्तापूर्ण शिक्षा
            </p>

            <p className="text-base text-primary-foreground/60 mb-8 max-w-lg mx-auto lg:mx-0">
              Class 6–12, Competitive Exams, Scholarships — all at the lowest price. 
              सबसे कम कीमत पर सबसे अच्छी शिक्षा।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button
                size="lg"
                className="gradient-saffron border-0 text-primary-foreground font-bold text-lg px-8 py-6 shadow-glow hover:opacity-90 transition-opacity"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 font-semibold text-lg px-8 py-6"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 justify-center lg:justify-start">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary-foreground font-heading">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-primary-foreground/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-card border border-primary-foreground/10">
              <img
                src={heroImage}
                alt="Students learning together"
                width={1920}
                height={1080}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-dark/60 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-saffron flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Free for Needy Students</p>
                  <p className="text-xs text-muted-foreground">ज़रूरतमंद छात्रों के लिए मुफ्त</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
