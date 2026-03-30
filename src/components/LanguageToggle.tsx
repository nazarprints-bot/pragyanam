import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-8 w-8 relative"
      title={language === "en" ? "हिंदी में बदलें" : "Switch to English"}
    >
      <span className="text-[11px] font-bold text-muted-foreground">
        {language === "en" ? "हि" : "EN"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
