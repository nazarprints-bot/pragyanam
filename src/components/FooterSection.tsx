import { GraduationCap, Heart } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="about" className="gradient-hero py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-saffron flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold font-heading text-primary-foreground">Pragyanam Academy</span>
                <span className="block text-xs text-primary-foreground/60">प्रज्ञानम्</span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm max-w-md leading-relaxed">
              India's most affordable education platform. Quality learning for every student, 
              regardless of their background. हर छात्र के लिए गुणवत्तापूर्ण शिक्षा।
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#courses" className="hover:text-primary-foreground transition-colors">Courses / कोर्स</a></li>
              <li><a href="#features" className="hover:text-primary-foreground transition-colors">Features / सुविधाएं</a></li>
              <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">Pricing / कीमत</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-primary-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact Us / संपर्क</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/40">
            © 2026 Pragyanam Academy. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/40 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for India's students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
