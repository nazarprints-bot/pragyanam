import { motion } from "framer-motion";
import {
  Video,
  FileText,
  Brain,
  MessageCircle,
  BarChart3,
  Globe,
  PlayCircle,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live Classes",
    titleHi: "लाइव कक्षाएं",
    desc: "Interactive live sessions with real-time doubt solving and auto-recording.",
    color: "bg-saffron-light text-accent-foreground",
  },
  {
    icon: PlayCircle,
    title: "Recorded Lectures",
    titleHi: "रिकॉर्डेड लेक्चर",
    desc: "Access video lectures anytime, chapter-wise organized with resume support.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: FileText,
    title: "Study Material",
    titleHi: "अध्ययन सामग्री",
    desc: "PDF notes, practice sheets, and chapter summaries — downloadable offline.",
    color: "bg-emerald/10 text-emerald",
  },
  {
    icon: Brain,
    title: "Smart Tests",
    titleHi: "स्मार्ट टेस्ट",
    desc: "Chapter tests, weekly exams, mock tests with instant results & ranking.",
    color: "bg-gold/10 text-saffron-dark",
  },
  {
    icon: MessageCircle,
    title: "Doubt Solving",
    titleHi: "डाउट सॉल्विंग",
    desc: "Post doubts, get teacher responses, and join discussion threads.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    titleHi: "प्रगति ट्रैकिंग",
    desc: "Track completion, test scores, and performance analytics at a glance.",
    color: "bg-indigo-light/10 text-indigo-light",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    titleHi: "बहु-भाषा",
    desc: "Full Hindi & English support. Regional languages coming soon.",
    color: "bg-saffron-light text-accent-foreground",
  },
  {
    icon: BookOpen,
    title: "All Subjects",
    titleHi: "सभी विषय",
    desc: "Class 6–12, Police, Army, Govt Jobs, and Scholarship exam prep.",
    color: "bg-secondary/10 text-secondary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Features / सुविधाएं
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground mt-3 mb-4">
            Everything You Need to <span className="text-gradient-saffron">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            सफलता के लिए सब कुछ एक ही जगह — Live classes से लेकर smart tests तक
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card rounded-2xl p-6 border border-border hover:shadow-card hover:border-primary/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs font-medium text-primary mb-2">{feature.titleHi}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
