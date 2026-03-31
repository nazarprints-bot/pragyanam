import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CoursesSection from "@/components/CoursesSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CoursesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
};

export default Index;
