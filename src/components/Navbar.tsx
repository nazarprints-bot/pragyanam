import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.courses"), href: "#courses" },
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.pricing"), href: "#pricing" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-soft" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-bold text-foreground tracking-tight">Pragyanam</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground h-8 px-3">
                {t("nav.login")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="h-8 px-4 text-[13px] font-semibold gradient-navy text-primary-foreground hover:opacity-90 rounded-lg">
                {t("nav.getStarted")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-1.5 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-5 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full text-[13px] h-9">{t("nav.login")}</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full text-[13px] h-9 gradient-navy text-primary-foreground hover:opacity-90">
                    {t("nav.getStarted")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
