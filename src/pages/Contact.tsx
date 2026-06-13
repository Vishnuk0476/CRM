import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { SEO } from "@/components/seo/SEO";
import { PremiumCTA } from "@/components/ui/PremiumCTA";

import { contactFormSchema, ContactFormData } from "@/lib/validations";
import { z } from "zod";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 11 4155 6447"],
    action: "Call Now",
    href: "tel:+911141556447",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@panyaglobal.in", "support@panyaglobal.in"],
    action: "Send Email",
    href: "mailto:info@panyaglobal.in",
  },
  {
    icon: MapPin,
    title: "Head Office",
    details: ["18/1, Basement, Village Samalkha", "Old Delhi Gurgaon Road, New Delhi-110037"],
    action: "Get Directions",
    href: "https://maps.google.com/?q=28.5089,77.0789",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: Emergency Only"],
    action: "Schedule Call",
    href: "/quote",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/contact-messages/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Submission failed");

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours. Check your email for confirmation.",
      });
      
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setErrors({});
    } catch (error: unknown) {
      console.error("Error sending contact message:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at +91 11 4155 6447",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Contact Us | Panya Global Relocation"
        description="Get in touch with Panya Global for your relocation needs. We are available to answer your queries and provide the best moving solutions."
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                Contact Us
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Get in <span className="text-secondary">Touch</span>
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 px-4">
                Have questions about our services? We're here to help. 
                Reach out to us and our team will respond within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-8 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 -mt-16 sm:-mt-24 relative z-20">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-border hover:border-secondary/30 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary/10 flex items-center justify-center mb-3 sm:mb-4">
                    <info.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-foreground mb-2">
                    {info.title}
                  </h3>
                  {info.details.map((detail) => (
                    <p key={detail} className="text-muted-foreground text-xs sm:text-sm">
                      {detail}
                    </p>
                  ))}
                  <a 
                    href={info.href}
                    className="inline-flex items-center gap-2 text-secondary font-semibold text-xs sm:text-sm mt-3 sm:mt-4 hover:underline"
                  >
                    {info.action}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-12 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                  Send Us a <span className="text-secondary">Message</span>
                </h2>
                <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`bg-card text-sm sm:text-base ${errors.name ? "border-destructive" : ""}`}
                      />
                      {renderError("name")}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`bg-card text-sm sm:text-base ${errors.email ? "border-destructive" : ""}`}
                      />
                      {renderError("email")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`bg-card text-sm sm:text-base ${errors.phone ? "border-destructive" : ""}`}
                      />
                      {renderError("phone")}
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className={`bg-card text-sm sm:text-base ${errors.subject ? "border-destructive" : ""}`}
                      />
                      {renderError("subject")}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your requirements..."
                      rows={6}
                      className={`bg-card text-sm sm:text-base ${errors.message ? "border-destructive" : ""}`}
                    />
                    {renderError("message")}
                  </div>

                  <Button
                    type="submit"
                    variant="premium"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Map & Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 sm:mb-6">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Find Us on <span className="text-secondary">Map</span>
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Visit our head office for a personal consultation or document verification.
                  </p>
                </div>

                <div id="map" className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl h-64 sm:h-80 mb-4 sm:mb-6 bg-muted border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.5!2d77.0789!3d28.5089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b4439999991%3A0x25f86d8c7c4e7f0a!2sPanya%20Global%20Movers!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Panya Global Movers Head Office - New Delhi"
                  />
                </div>

                {/* Quick Map Actions */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs sm:text-sm"
                    onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=28.5089,77.0789', '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-1 sm:mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    variant="secondary"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => window.open('https://wa.me/911141556447', '_blank', 'noopener,noreferrer')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-border">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                        Live Chat Support
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Get instant answers to your questions
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {[
                      "Average response time: 2 minutes",
                      "Available 24/7 for urgent inquiries",
                      "Multi-language support available",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-foreground text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => window.open('https://wa.me/911141556447', '_blank', 'noopener,noreferrer')}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Start Live Chat
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Contact;
