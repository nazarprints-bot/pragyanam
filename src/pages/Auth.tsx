import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
        toast.success("Login successful!");
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
        toast.success("Account created!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - Navy branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-navy-dark" />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-heading">Pragyanam</h2>
          <p className="text-white/60 text-sm max-w-sm">
            India's premium learning platform for students & teachers
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <div className="bg-card rounded-xl p-7 shadow-card border border-border">
            {/* Logo - mobile only */}
            <div className="flex items-center gap-2 mb-7 lg:hidden">
              <div className="w-8 h-8 rounded-lg gradient-navy flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-foreground tracking-tight">Pragyanam</span>
            </div>

            <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              {isLogin ? "Sign in to your account" : "Get started with Pragyanam"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label className="text-[13px] text-foreground">Full name</Label>
                    <Input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your name"
                      className="mt-1.5 h-9 text-[13px]"
                    />
                  </div>

                  <div>
                    <Label className="text-[13px] text-foreground">I am a</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {(["student", "teacher"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r })}
                          className={`py-2 px-3 rounded-lg border text-[13px] font-medium transition-all ${
                            formData.role === r
                              ? "border-gold bg-gold/10 text-gold-warm"
                              : "border-border text-muted-foreground hover:border-gold/30"
                          }`}
                        >
                          {r === "student" ? "Student" : "Teacher"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label className="text-[13px] text-foreground">Email</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-1.5 h-9 text-[13px]"
                />
              </div>

              <div>
                <Label className="text-[13px] text-foreground">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="h-9 text-[13px] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 text-[13px] font-medium gradient-navy text-white hover:opacity-90"
              >
                {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="text-[13px] text-center text-muted-foreground mt-5">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gold-warm font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
