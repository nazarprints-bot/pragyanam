import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    nameHi: "बेसिक",
    price: "₹99",
    period: "/mo",
    desc: "Essential learning for school students",
    features: ["Recorded lectures", "PDF study material", "Chapter-wise tests", "Basic doubt support"],
    popular: false,
    cta: "Get started",
  },
  {
    name: "Pro",
    nameHi: "प्रो",
    price: "₹249",
    period: "/mo",
    desc: "Complete preparation with live classes",
    features: ["Everything in Basic", "Live classes", "Mock exams & ranking", "Priority doubt solving", "Progress analytics", "Competitive exam prep"],
    popular: true,
    cta: "Get started",
  },
  {
    name: "Free",
    nameHi: "मुफ्त",
    price: "₹0",
    period: "",
    desc: "For students who truly need support",
    features: ["Full platform access", "Verification required", "Community supported", "No quality compromise"],
    popular: false,
    cta: "Apply now",
    isFree: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[12px] font-semibold text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            Affordable for everyone
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-md mx-auto">
            सबसे कम कीमत पर सबसे अच्छी शिक्षा
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative bg-card rounded-xl p-6 border transition-all duration-200 ${
                plan.popular ? "border-primary shadow-glow" : "border-border hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {plan.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Social Impact
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-[15px] font-semibold text-foreground">{plan.name}</h3>
                <p className="text-[11px] text-primary font-medium">{plan.nameHi}</p>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-bold text-foreground tracking-tight">{plan.price}</span>
                <span className="text-[13px] text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-5">{plan.desc}</p>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/auth">
                <Button
                  className={`w-full h-10 text-[13px] font-medium rounded-lg ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
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