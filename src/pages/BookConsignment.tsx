import { useState } from "react";
import { motion } from "framer-motion";
import {
  PackageSearch, Truck, ShieldCheck, MapPin, 
  Calendar, CheckCircle2, Loader2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const BookConsignment = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);

  const [formData, setFormData] = useState({
    txtName: "",
    email: "",
    txtmob: "",
    txtSendfrom: "",
    txtSendto: "",
    datepicker: "",
    txtmessage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/consignments/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || "Submission failed");
      
      setSuccessData({ id: data.data?.consignment_number || "PENDING" });
      toast({
        title: "Booking Successful!",
        description: `Your LR Number is ${data.data?.consignment_number}. A confirmation email has been sent to you.`,
        duration: 10000,
      });

    } catch (error: unknown) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please check your network and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-secondary/10 mb-6 sm:mb-8">
                <PackageSearch className="w-8 h-8 sm:w-12 sm:h-12 text-secondary" />
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Book Your <span className="text-secondary tracking-tight">Consignment</span>
              </h1>
              <p className="text-base sm:text-xl text-primary-foreground/80 px-4 max-w-2xl mx-auto leading-relaxed">
                Send packages anywhere quickly and securely. Fill out this quick enquiry form and our team will handle the rest.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 sm:py-20 bg-background relative -mt-8 sm:-mt-12 z-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {successData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border-2 border-green-500/20 rounded-2xl p-8 sm:p-12 shadow-2xl text-center"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                    Booking Confirmed!
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    We've sent a detailed confirmation to your email address.
                  </p>
                  
                  <div className="bg-muted/50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Your LR Number
                    </p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-tight">
                      {successData.id}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button variant="hero" onClick={() => window.location.href = `/track?type=lr&q=${successData.id}`}>
                      Track My Shipment Now
                    </Button>
                    <Button variant="outline" onClick={() => setSuccessData(null)}>
                      Book Another Shipment
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Left Side: Info Panel */}
                  <div className="md:w-1/3 bg-muted p-8 sm:p-10 flex flex-col items-start justify-center border-r border-border border-b sm:border-b-0">
                    <h3 className="text-xl font-bold font-heading text-foreground mb-6">Why Book With Us?</h3>
                    <ul className="space-y-6">
                      <li className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Fast Dispatch</p>
                          <p className="text-xs text-muted-foreground mt-1">Sameday pickup available</p>
                        </div>
                      </li>
                      <li className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">100% Secured</p>
                          <p className="text-xs text-muted-foreground mt-1">Fully transit insured packages</p>
                        </div>
                      </li>
                      <li className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <PackageSearch className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">Live Tracking</p>
                          <p className="text-xs text-muted-foreground mt-1">24/7 visibility updates</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Right Side: Exact Form Fields matched from old script */}
                  <div className="md:w-2/3 p-6 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Full Name *</label>
                          <Input name="txtName" value={formData.txtName} onChange={handleChange} required placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Mobile N. *</label>
                          <Input name="txtmob" type="tel" value={formData.txtmob} onChange={handleChange} required placeholder="+91 98765 43210" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">E-mail Address *</label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> Send From *</label>
                          <Input name="txtSendfrom" value={formData.txtSendfrom} onChange={handleChange} required placeholder="Pickup City / Area" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground flex items-center gap-1"><MapPin className="w-3 h-3 text-secondary"/> Send To *</label>
                          <Input name="txtSendto" value={formData.txtSendto} onChange={handleChange} required placeholder="Delivery City / Area" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> Service Date *</label>
                        <Input name="datepicker" type="date" value={formData.datepicker} onChange={handleChange} required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Message / Description</label>
                        <Textarea name="txtmessage" value={formData.txtmessage} onChange={handleChange} placeholder="Package details, special instructions, etc." rows={3} />
                      </div>

                      <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full mt-4 h-12 text-base shadow-xl gap-2">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Submit Booking Request
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookConsignment;
