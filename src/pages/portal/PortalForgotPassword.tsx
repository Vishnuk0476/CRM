import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Key } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

export default function PortalForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchApi('/api/customer/auth/forgot-password.php', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (data.success) {
        toast.success(data.data?.message || "OTP sent successfully.");
        setStep(2);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err: unknown) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchApi('/api/customer/auth/reset-password.php', {
        method: 'POST',
        body: JSON.stringify({ email, otp, password })
      });
      
      if (data.success) {
        toast.success("Password reset successfully. Please log in.");
        navigate('/portal/login');
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (err: unknown) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-outfit">Reset Password</h2>
            <p className="text-slate-500 mt-2">
              {step === 1 ? "Enter your email to receive an OTP." : "Enter the OTP and your new password."}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-white/50"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="123456"
                  className="text-center tracking-[0.5em] font-mono bg-white/50"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-white/50"
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{" "}
            <Link to="/portal/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
