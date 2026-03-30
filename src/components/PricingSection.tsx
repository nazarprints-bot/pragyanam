import { motion } from "framer-motion";
import { Check, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    nameHi: "बेसिक",
    price: "₹99",
    period: "/month",
    desc: "Essential learning for school students",
    descHi: "स्कूल छात्रों के लिए ज़रूरी शिक्षा",
    features: [
      "Recorded lectures access",
      "PDF study material",
      "Chapter-wise tests",
      "Basic doubt support",
    ],
    popular: false,
    cta: "Start Basic",
  },
  {
    name: "Pro",
    nameHi: "प्रो",
    price: "₹249",
    period: "/month",
    desc: "Complete preparation with live classes",
    descHi: "लाइव कक्षाओं के साथ पूरी तैयारी",
    features: [
      "Everything in Basic",
      "Live classes",
      "Mock exams & ranking",
      "Priority doubt solving",
      "Progress analytics",
      "Competitive exam prep",
    ],
    popular: true,
    cta: "Start Pro",
  },
  {
    name: "Free",
    nameHi: "मुफ्त",
    price: "₹0",
    period: "",
    desc: "For students who truly need support",
    descHi: "उन छात्रों के लिए जिन्हें सच में ज़रूरत है",
    features: [
      "Full platform access",
      "Verification required",
      "Supported by community",
      "No compromise on quality",
    ],
    popular: false,
    cta: "Apply Now",
    isFree: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Pricing / कीमत
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground mt-3 mb-4">
            Affordable for <span className="text-gradient-saffron">Everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            सबसे कम कीमत पर सबसे अच्छी शिक्षा — हर किसी के लिए
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-3xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "border-primary shadow-glow scale-105"
                  : "border-border hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-saffron text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  Most Popular / सबसे लोकप्रिय
                </div>
              )}

              {plan.isFree && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  Social Impact
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold font-heading text-foreground">{plan.name}</h3>
                <p className="text-sm text-primary">{plan.nameHi}</p>
              </div>

              <div className="mb-2">
                <span className="text-5xl font-extrabold font-heading text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{plan.desc}</p>
              <p className="text-xs text-primary mb-6">{plan.descHi}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 font-bold text-base ${
                  plan.popular
                    ? "gradient-saffron border-0 text-primary-foreground shadow-glow hover:opacity-90"
                    : plan.isFree
                    ? "bg-emerald border-0 text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:opacity-90"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
