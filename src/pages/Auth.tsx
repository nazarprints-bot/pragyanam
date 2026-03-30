import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student" as "student" | "teacher",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Login successful! / लॉगिन सफल!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: formData.role,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! / अकाउंट बन गया!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-saffron flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">Pragyanam</h1>
              <p className="text-xs text-muted-foreground">प्रज्ञानम्</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-foreground mb-1">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-6">
            {isLogin ? "वापस स्वागत है" : "नया अकाउंट बनाएं"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label className="text-foreground">Full Name / पूरा नाम</Label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-foreground">I am a / मैं हूँ</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "student" })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.role === "student"
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      👨‍🎓 Student / छात्र
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "teacher" })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.role === "teacher"
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      👨‍🏫 Teacher / शिक्षक
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label className="text-foreground">Email / ईमेल</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground">Password / पासवर्ड</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 gradient-saffron border-0 text-primary-foreground font-bold text-base shadow-glow hover:opacity-90"
            >
              {loading ? "Please wait..." : isLogin ? "Login / लॉगिन" : "Sign Up / साइन अप"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Sign Up / साइन अप" : "Login / लॉगिन"}
            </button>
          </p>

          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-primary">
              ← Back to Home / होम पर वापस
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
