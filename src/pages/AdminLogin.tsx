import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import logo from "@/assets/logo-black.webp";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: isLoading, login } = useAuth();
  const isAuthenticated = !!user;
  const isLocked = false;
  const lockRemaining = 0;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate("/admin");
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoginError(null);

    try {
      loginSchema.parse({ email, password });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await login(email, password);

      if (error) {
        setLoginError(error.message || "Login Failed");
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
          <div className="flex justify-center mb-8">
            <img 
              src={logo}
              alt="Panya Global"
              className="h-16 w-auto"
            loading="lazy" decoding="async" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to manage quotes and customers
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          )}

          {isLocked && lockRemaining > 0 && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Account Locked</span>
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono">
                {formatTime(lockRemaining)}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Please wait before trying again
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                    setLoginError(null);
                  }}
                  placeholder="admin@panyaglobal.in"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  disabled={isLocked}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                    setLoginError(null);
                  }}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isSubmitting || isLocked}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : isLocked ? (
                <>
                  <Shield className="w-4 h-4" />
                  Locked
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-xs">
              For admin access, contact{" "}
              <a href="mailto:vishnu.kumar@panyaglobal.in" className="text-secondary hover:underline">
                vishnu.kumar@panyaglobal.in
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
            ← Back to Website
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
