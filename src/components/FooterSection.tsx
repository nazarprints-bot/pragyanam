import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterSection = () => {
  const { t } = useLanguage();

  return (
    <footer id="about" className="gradient-navy">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-foreground" />
              </div>
              <span className="text-[15px] font-bold text-primary-foreground">Pragyanam Academy</span>
            </div>
            <p className="text-[13px] text-primary-foreground/60 max-w-sm leading-relaxed">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="text-[12px] font-semibold text-accent uppercase tracking-wider mb-4">{t("footer.platform")}</h4>
            <ul className="space-y-2.5 text-[13px] text-primary-foreground/60">
              <li><a href="#courses" className="hover:text-primary-foreground transition-colors">{t("nav.courses")}</a></li>
              <li><a href="#features" className="hover:text-primary-foreground transition-colors">{t("nav.features")}</a></li>
              <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">{t("nav.pricing")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-semibold text-accent uppercase tracking-wider mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2.5 text-[13px] text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.helpCenter")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.contact")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-primary-foreground/40">{t("footer.rights")}</p>
          <p className="text-[12px] text-primary-foreground/40">{t("footer.madeFor")}</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
