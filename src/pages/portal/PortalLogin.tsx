import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

export default function PortalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchApi('/api/customer/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (data.success && data.data) {
        toast.success("Welcome back!");
        login(data.data.token, data.data.customer);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err: unknown) {
      toast.error(err.message || "An error occurred during login.");
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
            <h2 className="text-3xl font-bold text-slate-900 font-outfit">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Log in to view your quotes and track shipments.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="bg-white/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/portal/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/portal/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
