import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterSection = () => {
  const { t } = useLanguage();

  return (
    <footer id="about" className="gradient-navy">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-8 sm:mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-gold flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-[13px] sm:text-[15px] font-bold text-primary-foreground">Pragyanam Academy</span>
            </div>
            <p className="text-[11px] sm:text-[13px] text-primary-foreground/60 max-w-sm leading-relaxed">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="text-[11px] sm:text-[12px] font-semibold text-accent uppercase tracking-wider mb-3 sm:mb-4">{t("footer.platform")}</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-[13px] text-primary-foreground/60">
              <li><a href="#courses" className="hover:text-primary-foreground transition-colors">{t("nav.courses")}</a></li>
              <li><a href="#features" className="hover:text-primary-foreground transition-colors">{t("nav.features")}</a></li>
              <li><a href="#pricing" className="hover:text-primary-foreground transition-colors">{t("nav.pricing")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] sm:text-[12px] font-semibold text-accent uppercase tracking-wider mb-3 sm:mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-[13px] text-primary-foreground/60">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.helpCenter")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.contact")}</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-[12px] text-primary-foreground/40">{t("footer.rights")}</p>
          <p className="text-[10px] sm:text-[12px] text-primary-foreground/40">{t("footer.madeFor")}</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
