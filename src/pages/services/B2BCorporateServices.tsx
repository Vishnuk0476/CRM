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
  Calendar,
  UserCheck,
  DollarSign,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import SectionReveal from "@/components/layout/SectionReveal";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-b2b-corporate.webp";

const B2BCorporateServices = () => {
  const formFields = [
    {
      id: "companyName",
      label: "Company Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter your company name"
    },
    {
      id: "industry",
      label: "Industry",
      type: "select" as const,
      required: true,
      options: [
        { value: "it-technology", label: "IT & Technology" },
        { value: "banking-finance", label: "Banking & Finance" },
        { value: "manufacturing", label: "Manufacturing" },
        { value: "healthcare", label: "Healthcare" },
        { value: "consulting", label: "Consulting" },
        { value: "ecommerce-logistics", label: "E-commerce & Logistics" },
        { value: "education", label: "Education" },
        { value: "government", label: "Government/Public Sector" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "employeeCount",
      label: "Employee Count",
      type: "select" as const,
      required: true,
      options: [
        { value: "10-50", label: "10-50 employees" },
        { value: "51-200", label: "51-200 employees" },
        { value: "201-500", label: "201-500 employees" },
        { value: "501-1000", label: "501-1000 employees" },
        { value: "1000+", label: "1000+ employees" }
      ]
    },
    {
      id: "relocationType",
      label: "Relocation Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "domestic", label: "Domestic Relocations" },
        { value: "international", label: "International Relocations" },
        { value: "both", label: "Both Domestic & International" }
      ]
    },
    {
      id: "estimatedRelocations",
      label: "Estimated Annual Relocations",
      type: "select" as const,
      required: true,
      options: [
        { value: "1-10", label: "1-10 per year" },
        { value: "11-50", label: "11-50 per year" },
        { value: "51-100", label: "51-100 per year" },
        { value: "100+", label: "100+ per year" }
      ]
    },
    {
      id: "name",
      label: "Contact Person",
      type: "text" as const,
      required: true,
      placeholder: "Name of HR/Relocation contact"
    },
    {
      id: "email",
      label: "Contact Email",
      type: "email" as const,
      required: true,
      placeholder: "hr@company.com"
    },
    {
      id: "phone",
      label: "Contact Phone",
      type: "tel" as const,
      required: true,
      placeholder: "+91 98765 43210"
    },
    {
      id: "servicesNeeded",
      label: "Services Needed",
      type: "textarea" as const,
      required: false,
      placeholder: "List specific services you're interested in (Packing & Moving, House Search, School Search, Rental Car, Pet Relocation, Storage Services, etc.)"
    }
  ];

  const coreServices = [
    {
      icon: Truck,
      title: "Packing & Moving",
      description: "Professional packing, secure transport, and unpacking services for employee households",
      features: ["Professional packing materials", "Furniture disassembly/reassembly", "Secure transport", "Unpacking & setup"]
    },
    {
      icon: Home,
      title: "House Search",
      description: "Comprehensive housing assistance to help employees find suitable accommodation",
      features: ["Market analysis", "Property shortlisting", "Viewing coordination", "Lease negotiation"]
    },
    {
      icon: GraduationCap,
      title: "School Search",
      description: "Assistance in finding quality educational institutions for employee families",
      features: ["School research", "Admission guidance", "Documentation support", "Area analysis"]
    },
    {
      icon: Car,
      title: "Rental Car",
      description: "Temporary transportation solutions during the transition period",
      features: ["Car rental coordination", "Insurance coverage", "Extended rental options", "Corporate rates"]
    },
    {
      icon: Dog,
      title: "Pet Relocation",
      description: "Stress-free pet moving services with all necessary documentation",
      features: ["Pet travel documentation", "Veterinary coordination", "Pet transport", "Customs clearance"]
    },
    {
      icon: Package,
      title: "Storage Services",
      description: "Secure short-term and long-term storage solutions",
      features: ["Climate-controlled storage", "Insurance coverage", "Flexible duration", "Inventory management"]
    }
  ];

  const corporateBenefits = [
    {
      icon: UserCheck,
      title: "Dedicated Account Management",
      description: "Single point of contact for all employee relocations"
    },
    {
      icon: DollarSign,
      title: "Cost Control & Predictability",
      description: "Fixed pricing models and volume discounts"
    },
    {
      icon: ShieldCheck,
      title: "Compliance & Risk Management",
      description: "Full compliance with corporate policies and regulations"
    },
    {
      icon: TrendingUp,
      title: "Employee Satisfaction",
      description: "Enhanced employee experience leading to better retention"
    },
    {
      icon: Calendar,
      title: "Streamlined Process",
      description: "Efficient workflows reducing administrative burden"
    },
    {
      icon: LineChart,
      title: "Analytics & Reporting",
      description: "Detailed reports on costs, timelines, and satisfaction"
    }
  ];

  const stats = [
    { value: "500+", label: "Corporate Clients" },
    { value: "50+", label: "Countries Served" },
    { value: "10,000+", label: "Assignments Managed" },
    { value: "98%", label: "Client Satisfaction" }
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
              <span className="text-sm font-medium">B2B Corporate Services</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Corporate Employee{" "}
              <span className="text-secondary">Relocation Management</span>
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
              <a href="tel:+911141556447">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call: +91 11 4155 6447
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
                We act as your single-point corporate relocation partner, managing every moving part-from household shifting to settling-in—under one controlled system.
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

      {/* Comprehensive Service Form */}
      <SectionReveal>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
                Comprehensive Services
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
                  className="flex flex-col bg-card rounded-xl p-6 border border-border hover:border-secondary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Corporate Benefits */}
      <SectionReveal>
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corporateBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 border-border/50">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-secondary" />
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
              {[
                "IT & Technology Companies",
                "Banking & Financial Services",
                "Manufacturing & Industrial Firms",
                "Pharma & Healthcare Organizations",
                "Consulting & Professional Services",
                "E-commerce & Logistics Companies",
                "Educational Institutions",
                "Government & Public Sector"
              ].map((industry, index) => (
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
                {[
                  "Pan-India execution capability",
                  "Corporate-grade processes",
                  "Compliance-focused operations",
                  "Experience with enterprise HR teams",
                  "Scalable for 10 or 10,000 relocations",
                  "Dedicated account management"
                ].map((point, index) => (
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
                    <a href="tel:+911141556447" className="text-foreground font-medium hover:text-secondary transition-colors">
                      +91 11 4155 6447
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
                    "Customizable service packages"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ServiceInquiryForm 
              serviceName="B2B Corporate Services"
              serviceType="b2b-corporate"
              fields={formFields}
              additionalInfo={[
                "Corporate relocation pricing is based on company size, volume of relocations, service requirements, and geographic scope.",
                "Our corporate team will contact you within 24 hours to discuss your specific needs and provide a customized proposal."
              ]}
            />
          </div>
        </div>
      </section>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default B2BCorporateServices;
