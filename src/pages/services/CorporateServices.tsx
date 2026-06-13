import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  MapPin,
  FileText,
  Home,
  GraduationCap,
  Briefcase,
  CreditCard,
  Building2,
  Globe,
  Truck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Shield,
  Clock,
  HeadphonesIcon,
  LayoutDashboard,
  BarChart3,
  FileCheck,
  Settings,
  Star,
  Mail,
  Car,
  Dog,
  Wrench,
  Package,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import SectionReveal from "@/components/layout/SectionReveal";
import B2BCorporateInquiryForm from "@/components/services/B2BCorporateInquiryForm";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-corporate.webp";

const CorporateServices = () => {
  const portalFeatures = [
    { icon: LayoutDashboard, title: "Bulk Employee Relocation Booking", description: "Manage multiple transfers in one workflow" },
    { icon: Users, title: "Individual Employee Dashboards", description: "Employees track their own relocation progress" },
    { icon: MapPin, title: "Real-Time Relocation Tracking", description: "Live status updates across all locations" },
    { icon: CreditCard, title: "Centralized Billing & Invoicing", description: "One invoice. One vendor. Zero confusion." },
    { icon: FileCheck, title: "Compliance & Audit Reporting", description: "Documentation aligned with HR & finance needs" },
    { icon: Star, title: "Employee Satisfaction Surveys", description: "Post-move feedback to measure experience" },
    { icon: BarChart3, title: "Cost Tracking & Analytics", description: "City-wise, department-wise, employee-wise cost data" },
    { icon: Settings, title: "Policy Customization", description: "Relocation rules aligned to your internal HR policies" },
  ];

  const coreServices = [
    { icon: Truck, title: "Household Goods Shifting", description: "Secure, insured, and professionally managed" },
    { icon: Home, title: "Temporary Accommodation", description: "Short-term housing coordination" },
    { icon: GraduationCap, title: "School Admission Assistance", description: "Support for employee families during relocation" },
    { icon: MapPin, title: "House Hunting Services", description: "Location-based rental & housing assistance" },
    { icon: Car, title: "Car Rental & Local Transport", description: "Short-term mobility solutions" },
    { icon: Globe, title: "Local Area Orientation", description: "Helping employees settle faster in new cities" },
    { icon: Wrench, title: "Settling-In Services", description: "Utilities, registrations, basic setup support" },
    { icon: Package, title: "Handyman & Home Setup", description: "Post-move assistance for quick stabilization" },
    { icon: Dog, title: "Pet Relocation Services", description: "Safe and compliant pet movement solutions" },
  ];

  const corporateBenefits = [
    { icon: Users, title: "Dedicated Corporate Account Manager", description: "One SPOC for all relocations" },
    { icon: LineChart, title: "Volume-Based Pricing (Up to 40%)", description: "Lower cost per move as volume increases" },
    { icon: Clock, title: "Priority Service Scheduling", description: "Faster execution for urgent transfers" },
    { icon: HeadphonesIcon, title: "24/7 Emergency Support", description: "Because relocations don't follow office hours" },
    { icon: FileText, title: "Customized SLA Agreements", description: "Defined timelines, penalties, and benchmarks" },
    { icon: CreditCard, title: "Fixed Annual Corporate Contracts", description: "Cost predictability for HR & finance teams" },
    { icon: BarChart3, title: "Quarterly Business Reviews (QBRs)", description: "Performance review & optimization" },
    { icon: Star, title: "Structured Employee Feedback", description: "Measurable satisfaction metrics" },
  ];

  const industries = [
    "IT & Technology Companies",
    "Banking & Financial Services",
    "Manufacturing & Industrial Firms",
    "Pharma & Healthcare Organizations",
    "Consulting & Professional Services",
    "E-commerce & Logistics Companies",
  ];

  const stats = [
    { value: "500+", label: "Corporate Clients" },
    { value: "50+", label: "Countries Served" },
    { value: "10,000+", label: "Assignments Managed" },
    { value: "98%", label: "Client Satisfaction" },
  ];

  const whyChooseUs = [
    "Pan-India execution capability",
    "Corporate-grade processes",
    "Compliance-focused operations",
    "Experience with enterprise HR teams",
    "Scalable for 10 or 10,000 relocations",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">B2B Corporate Mobility Solutions</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Corporate Employee{" "}
              <span className="text-secondary">Relocation Management</span>{" "}
              Services
            </h1>
            
            <p className="text-primary-foreground/80 text-lg md:text-xl mb-4 max-w-3xl mx-auto">
              End-to-End Relocation Solutions for HR & Talent Mobility Teams
            </p>

            <p className="text-primary-foreground/70 text-base mb-8 max-w-3xl mx-auto">
              We help HR departments eliminate relocation chaos, control costs, ensure compliance, and deliver a smooth employee experience—without operational burden.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#inquiry-form">
                <Button size="lg" variant="hero" className="gap-2">
                  Get Corporate Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="tel:+918800446447">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Corporate Desk: 8800446447
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <EasyCoverBanner />

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HR Teams Choose Us */}
      <SectionReveal>
        <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Why HR Teams Choose Us
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Relocation isn't just logistics.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  It's employee retention.
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">
                We act as your single-point corporate relocation partner, managing every moving part—from household shifting to settling-in—under one controlled system.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                "Reduced HR workload",
                "Predictable relocation costs",
                "Higher employee satisfaction",
                "Centralized visibility & reporting",
                "SLA-driven execution",
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-card rounded-lg p-3 border border-border"
                >
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Corporate Portal Features */}
      <SectionReveal>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Corporate Portal
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Dedicated{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  Relocation Portal
                </span>{" "}
                for HR Teams
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our secure corporate portal gives HR teams full control, transparency, and reporting across all employee relocations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {portalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border hover:border-secondary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Core Services */}
      <SectionReveal>
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Complete Services
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Complete Employee{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  Relocation Services
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We manage every stage of the employee move, ensuring continuity, comfort, and compliance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 bg-card rounded-xl p-5 border border-border hover:border-secondary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Corporate Benefits */}
      <SectionReveal>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Corporate Benefits
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                This is where you stop{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  bleeding time and money
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {corporateBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 border-border/50">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                        <benefit.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <h3 className="font-heading font-bold text-foreground mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Industries We Serve */}
      <SectionReveal>
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Industries We Serve
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                We support companies with high-frequency workforce mobility
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-lg px-5 py-3 border border-border hover:border-secondary/50 transition-all"
                >
                  <span className="text-sm font-medium text-foreground">{industry}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Why Panya Global */}
      <SectionReveal>
        <section className="py-20 bg-gradient-to-r from-primary to-primary/90">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Why Panya Global Relocation Pvt. Ltd.
                </h2>
                <p className="text-primary-foreground/80 text-lg">
                  Because HR teams don't need another vendor. They need a <span className="font-semibold">controlled relocation ecosystem</span>.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whyChooseUs.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg px-4 py-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-primary-foreground font-medium">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Inquiry Form Section */}
      <section id="inquiry-form" className="py-20 bg-background scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Start Your Partnership
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Start Your Corporate{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
                  Relocation Partnership
                </span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Looking to streamline employee relocations, reduce costs, and improve employee experience? Let's build a relocation program that actually works for HR.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href="mailto:info@panyaglobal.in" className="text-foreground font-medium hover:text-secondary transition-colors">
                      info@panyaglobal.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Corporate Desk</p>
                    <a href="tel:+918800446447" className="text-foreground font-medium hover:text-secondary transition-colors">
                      +91 8800446447
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-heading font-bold text-foreground mb-4">Why partner with us?</h3>
                <ul className="space-y-3">
                  {[
                    "Single vendor for all relocation needs",
                    "Transparent pricing with no hidden costs",
                    "Dedicated account manager for your company",
                    "Real-time tracking and reporting",
                    "Proven track record with Fortune 500 companies",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <B2BCorporateInquiryForm />
          </div>
        </div>
      </section>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default CorporateServices;
