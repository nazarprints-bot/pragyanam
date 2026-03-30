import { GraduationCap } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="about" className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-[15px] font-semibold text-foreground">Pragyanam Academy</span>
                <span className="block text-[11px] text-muted-foreground">प्रज्ञानम्</span>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
              India's most affordable education platform. Quality learning for every student, 
              regardless of their background.
            </p>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              <li><a href="#courses" className="hover:text-foreground transition-colors">Courses</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-foreground uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-[13px] text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            © 2026 Pragyanam Academy. All rights reserved.
          </p>
          <p className="text-[12px] text-muted-foreground">
            Made for India's students 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;