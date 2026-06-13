import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Briefcase, Phone, Mail, User, Lock } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

export default function PortalRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    company: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useCustomerAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await fetchApi('/api/customer/auth/register.php', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (data.success && data.data) {
        toast.success("Account created successfully!");
        login(data.data.token, data.data.customer);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err: unknown) {
      toast.error(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-outfit">Create an Account</h2>
            <p className="text-slate-500 mt-2">Join to manage your relocations effortlessly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="name" value={formData.name} onChange={handleChange} required className="pl-9 bg-white/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="phone" value={formData.phone} onChange={handleChange} required className="pl-9 bg-white/50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="company" value={formData.company} onChange={handleChange} className="pl-9 bg-white/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input id="designation" value={formData.designation} onChange={handleChange} className="pl-9 bg-white/50" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="pl-9 bg-white/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="pl-9 bg-white/50" minLength={6} />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/portal/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
