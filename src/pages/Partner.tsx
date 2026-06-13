import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Building2, TrendingUp, Users, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";

const benefits = [
  {
    icon: TrendingUp,
    title: "Business Growth",
    description: "Expand your business with our established brand and nationwide network.",
  },
  {
    icon: Building2,
    title: "Brand Support",
    description: "Leverage our ISO certified brand reputation and marketing support.",
  },
  {
    icon: Users,
    title: "Training & Support",
    description: "Comprehensive training and ongoing operational support for your team.",
  },
  {
    icon: CheckCircle2,
    title: "Quality Standards",
    description: "Access to our proven SOPs and quality management systems.",
  },
];

const partnerTypes = [
  "Franchise Partner",
  "Business Associate",
  "Fleet Partner",
  "Warehouse Partner",
  "Sales Agent",
];

const Partner = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. Our team will contact you within 24-48 hours.",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.panyaglobalmovers.com/extra-images/slider_bg1.webp')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Handshake className="w-16 h-16 mx-auto mb-6 text-secondary" />
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Become a Partner
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Join India's leading relocation company. Expand your business with Panya Global Relocation's franchise and partnership opportunities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Partner With Us?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Benefit from our 13+ years of experience and established nationwide network
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-12">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
                >
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                    Contact Our Partnership Team
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Phone</p>
                        <a href="tel:+911142321118" className="text-muted-foreground hover:text-primary">
                          +91 11 42321118
                        </a>
                        <br />
                        <a href="tel:+918800446447" className="text-muted-foreground hover:text-primary">
                          +91 8800446447
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a href="mailto:info@panyaglobal.in" className="text-muted-foreground hover:text-primary">
                          info@panyaglobal.in
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Head Office</p>
                        <p className="text-muted-foreground text-sm">
                          18/1, Basement, Village Samalkha,<br />
                          Old Delhi Gurgaon Road,<br />
                          New Delhi-110037
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Form */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-3"
                >
                  <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-6">
                      Partnership Application
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input id="name" placeholder="Enter your name" required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="your@email.com" required />
                      </div>
                      <div>
                        <Label htmlFor="company">Company Name (if any)</Label>
                        <Input id="company" placeholder="Your company name" />
                      </div>
                      <div>
                        <Label htmlFor="city">City / Location *</Label>
                        <Input id="city" placeholder="Where would you like to operate?" required />
                      </div>
                      <div>
                        <Label htmlFor="partnerType">Partnership Type *</Label>
                        <select
                          id="partnerType"
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select partnership type</option>
                          {partnerTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="message">Tell us about yourself</Label>
                        <Textarea
                          id="message"
                          placeholder="Your experience, investment capacity, why you want to partner with us..."
                          rows={4}
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <CTA />
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Partner;
