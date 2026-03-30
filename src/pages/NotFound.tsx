import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold font-heading text-gradient-gold">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <a href="/">
          <Button className="gradient-navy text-white hover:opacity-90 mt-2">
            Return to Home
          </Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
