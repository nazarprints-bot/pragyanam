import { GraduationCap } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="about" className="gradient-navy">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-foreground" />
              </div>
              <div>
                <span className="text-[15px] font-bold text-primary-foreground">Pragyanam Academy</span>
              </div>
            </div>
            <p className="text-[13px] text-primary-foreground/60 max-w-sm leading-relaxed">
              India's most affordable education platform. Quality learning for every student, 
              regardless of their background.
            </p>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-accent uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[13px] text-primary-foreground/60">
              <li><a href="#courses" className="hover:text-primary-foreground transition-colors">Courses</a></li>
              <li><a href="#features" className="hover:text-primary-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-accent uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-[13px] text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-primary-foreground/40">
            © 2026 Pragyanam Academy. All rights reserved.
          </p>
          <p className="text-[12px] text-primary-foreground/40">
            Made for India's students 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
