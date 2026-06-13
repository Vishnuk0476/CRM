import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Home, Building2, Plane, Wrench, ArrowRight, Truck, Ship, Car, PawPrint,
  Warehouse, Server, Factory, GraduationCap, Search, Bug, Hammer, Recycle,
  Palette, Briefcase, Sparkles, Globe, Shield, Clock, Users, Box, Calendar,
  DollarSign, Award, ShieldCheck, Globe2, CheckCircle2, ChevronRight,
  MapPin, Phone, Star, Zap, Package, SprayCanIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { PremiumCTA, SectionCTA, HeroCTA } from "@/components/ui/PremiumCTA";
import { SEO } from "@/components/seo/SEO";

// -- Data ---------------------------------------------------------------------

const serviceCategories = [
  {
    id: "home-relocation",
    icon: Home,
    title: "Home Relocation",
    tagline: "Your belongings, our responsibility",
    description: "Professional residential moving with expert packing, safe transport, and storage solutions for local and international moves.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    color: "from-[hsl(213,55%,23%)] to-[hsl(199,89%,48%)]",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    services: [
      { name: "Local Moving", href: "/services/local-moving", icon: Truck },
      { name: "Long Distance Moving", href: "/services/long-distance-moving", icon: Truck },
      { name: "International Moving", href: "/services/international-moving", icon: Ship },
      { name: "Vehicle Transport", href: "/services/vehicle-transport", icon: Car },
      { name: "Pet Relocation", href: "/services/pet-relocation", icon: PawPrint },
      { name: "Storage Services", href: "/services/storage-services", icon: Warehouse },
    ],
  },
  {
    id: "workplace-relocation",
    icon: Building2,
    title: "Workplace Relocation",
    tagline: "Zero downtime, maximum efficiency",
    description: "Commercial moving for offices, IT centers, labs, and industrial facilities with minimal downtime and maximum efficiency.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    color: "from-emerald-600 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    services: [
      { name: "Office Relocation", href: "/services/office-relocation", icon: Building2 },
      { name: "IT & Data Center", href: "/services/it-datacenter", icon: Server },
      { name: "Industrial Relocation", href: "/services/industrial", icon: Factory },
      { name: "Healthcare Relocation", href: "/services/healthcare", icon: Building2 },
      { name: "Lab Relocation", href: "/services/lab-relocation", icon: Server },
      { name: "Scrap Service", href: "/services/scrap-service", icon: Recycle },
    ],
  },
  {
    id: "fine-art-moving",
    icon: Palette,
    title: "Fine Art Moving",
    tagline: "Museum-grade care for your treasures",
    description: "Museum-grade handling for artworks and collectibles with climate-controlled transport and expert care.",
    image: "https://images.unsplash.com/photo-1515153936615-7142985d2302?w=800&h=600&fit=crop",
    color: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    services: [
      { name: "Climate-controlled transport", href: "/services/fine-art", icon: Box },
      { name: "Insurance coverage", href: "/services/fine-art", icon: Shield },
      { name: "Expert art handlers", href: "/services/fine-art", icon: Users },
      { name: "Flexible scheduling", href: "/services/fine-art", icon: Calendar },
    ],
  },
  {
    id: "b2b-corporate-services",
    icon: Briefcase,
    title: "B2B Corporate Services",
    tagline: "Employee relocation at enterprise scale",
    description: "Employee relocation management for HR teams with centralized billing, tracking, and policy execution.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop",
    color: "from-[hsl(213,55%,23%)] to-indigo-600",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    services: [
      { name: "Employee dashboard & tracking", href: "/services/corporate-services", icon: Users },
      { name: "Centralized billing", href: "/services/corporate-services", icon: DollarSign },
      { name: "Policy-based execution", href: "/services/corporate-services", icon: Shield },
      { name: "Global coverage", href: "/services/corporate-services", icon: Globe },
    ],
  },
  {
    id: "mobility-services",
    icon: Plane,
    title: "Mobility Services",
    tagline: "Settle in faster, stress-free",
    description: "Settlement support including school search, house hunting, and temporary transportation solutions.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
    color: "from-violet-600 to-purple-500",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    services: [
      { name: "School Search", href: "/services/school-search", icon: GraduationCap },
      { name: "House Search", href: "/services/house-search", icon: Search },
      { name: "Car Rental", href: "/services/car-rental", icon: Car },
    ],
  },
  {
    id: "additional-services",
    icon: Wrench,
    title: "Additional Services",
    tagline: "Complete your move, end-to-end",
    description: "Complete your relocation with pest control, professional cleaning, and handyman services.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop",
    color: "from-rose-600 to-pink-500",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    services: [
      { name: "Pest Control", href: "/services/pest-control", icon: Bug },
      { name: "Exit Clean Service", href: "/services/exit-clean", icon: SprayCanIcon },
      { name: "Handyman Services", href: "/services/handyman", icon: Hammer },
    ],
  },
];

const stats = [
  { value: "16+", label: "Years Experience", icon: Award },
  { value: "50K+", label: "Happy Clients", icon: Users },
  { value: "500+", label: "Cities Covered", icon: MapPin },
  { value: "24/7", label: "Customer Support", icon: Phone },
];

const whyUs = [
  { icon: ShieldCheck, title: "ISO 9001 Certified", description: "Internationally certified quality standards ensuring every move is handled with professional excellence.", gradient: "from-[hsl(213,55%,23%)] to-[hsl(199,89%,48%)]" },
  { icon: Globe2, title: "500+ Locations", description: "Nationwide and global coverage through our extensive partner network across India and 80+ countries.", gradient: "from-emerald-600 to-teal-500" },
  { icon: Award, title: "100% Satisfaction", description: "Guaranteed customer satisfaction backed by our Easy Cover Warranty and commitment to excellence.", gradient: "from-violet-600 to-purple-500" },
  { icon: Clock, title: "24/7 Support", description: "Round-the-clock assistance via phone, email, and our live chat - whenever you need us.", gradient: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Fast Execution", description: "Streamlined processes with dedicated move coordinators ensure on-time delivery every single time.", gradient: "from-rose-600 to-pink-500" },
  { icon: Package, title: "Safe Packaging", description: "Premium packing materials and proven techniques protect your valuables throughout transit.", gradient: "from-indigo-600 to-violet-500" },
];

// -- Animated Section Wrapper -------------------------------------------------

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// -- Page ---------------------------------------------------------------------

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Premium Relocation Services | International Packers and Movers"
        description="Explore Panya Global's wide range of relocation services including home moving, corporate relocation, fine art moving, and more."
      />
      <Navbar />

      <main>
        {/* -- HERO ------------------------------------------------- */}
        <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-[hsl(213,55%,15%)] via-[hsl(213,55%,23%)] to-[hsl(213,40%,30%)]">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-[hsl(199,89%,48%)] opacity-10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-[hsl(199,89%,58%)] opacity-8 rounded-full blur-3xl" />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "linear-gradient(to right,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.06) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-[hsl(199,89%,65%)] animate-pulse" />
                <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">India's Trusted Relocation Partner</span>
                <Sparkles className="w-4 h-4 text-[hsl(199,89%,65%)]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.06] tracking-tight mb-6"
              >
                Complete Relocation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[hsl(199,89%,65%)] to-[hsl(199,89%,80%)]">
                  Solutions
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
              >
                As leading <strong className="text-white font-semibold">packers and movers</strong>, we offer comprehensive services - from expert packing to secure international transit. Make your move seamless today.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <HeroCTA />
              </motion.div>

              {/* Floating service chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 flex flex-wrap justify-center gap-2"
              >
                {[Truck, Ship, Building2, Car, Palette, PawPrint].map((Icon, i) => {
                  const labels = ["Local Moving", "International", "Office Moves", "Vehicle Transport", "Fine Art", "Pet Relocation"];
                  return (
                    <motion.div
                      key={labels[i]}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm backdrop-blur-sm"
                    >
                      <Icon className="w-3.5 h-3.5 text-[hsl(199,89%,65%)]" />
                      {labels[i]}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-14" preserveAspectRatio="none">
              <path d="M0 56L1440 56L1440 28C1200 56 720 0 0 28L0 56Z" fill="hsl(210,20%,98%)" />
            </svg>
          </div>
        </section>

        {/* -- STATS BAR -------------------------------------------- */}
        <section className="bg-white border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center py-8 px-6 gap-2 group hover:bg-sky-50 transition-colors"
                >
                  <stat.icon className="w-6 h-6 text-[hsl(199,89%,48%)] group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-extrabold text-[hsl(213,55%,23%)]">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* -- SERVICE CATEGORIES ----------------------------------- */}
        <section className="py-24 bg-gradient-to-b from-background to-[hsl(210,20%,97%)] relative overflow-hidden">
          {/* Subtle decorative blobs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <FadeIn className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-sky-50 border border-sky-200 mb-6">
                <div className="w-2 h-2 rounded-full bg-[hsl(199,89%,48%)]" />
                <span className="text-[hsl(199,89%,40%)] text-sm font-semibold tracking-wider uppercase">What We Do</span>
                <Sparkles className="w-4 h-4 text-[hsl(199,89%,48%)]" />
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[hsl(213,55%,23%)] mb-4">
                Explore Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(199,89%,40%)] to-[hsl(213,55%,35%)]">
                  Premium Services
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We offer a complete range of relocation and mobility services designed to make your transition smooth and hassle-free.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {serviceCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (index % 2) * 0.12 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl overflow-hidden bg-white border border-border shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img 
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy" decoding="async" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-75`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full ${cat.badgeBg} ${cat.badgeText} text-xs font-semibold mb-2`}>
                          {cat.tagline}
                        </span>
                        <h3 className="font-heading text-2xl font-bold text-white drop-shadow">{cat.title}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg flex-shrink-0 ml-3`}>
                        <cat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{cat.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {cat.services.map((service) => (
                        <Link
                          key={service.name}
                          to={service.href}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[hsl(199,89%,48%)] hover:bg-sky-50 transition-all group/item"
                        >
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                            <service.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-slate-700 text-xs font-medium group-hover/item:text-[hsl(213,55%,23%)] transition-colors leading-tight">{service.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 ml-auto group-hover/item:text-[hsl(199,89%,48%)] transition-colors flex-shrink-0" />
                        </Link>
                      ))}
                    </div>

                    <Link to="/quote">
                      <button className={`w-full py-3 px-5 rounded-xl bg-gradient-to-r ${cat.color} text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md`}>
                        Get a Quote <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* -- WHY CHOOSE US ---------------------------------------- */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(199,89%,48%)] to-transparent opacity-30" />
          </div>

          <div className="container mx-auto px-4">
            <FadeIn className="text-center mb-14">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[hsl(213,55%,23%)]/5 border border-[hsl(213,55%,23%)]/15 mb-6">
                <Star className="w-3.5 h-3.5 text-[hsl(199,89%,48%)]" />
                <span className="text-[hsl(213,55%,23%)] text-sm font-semibold tracking-wider uppercase">Why Panya Global</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[hsl(213,55%,23%)] mb-4">
                What Makes Us{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(199,89%,40%)] to-[hsl(213,55%,35%)]">
                  Uniquely Exceptional
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                16+ years of trust, built one move at a time.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-2xl bg-background border border-border hover:border-[hsl(199,89%,48%)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[hsl(213,55%,23%)] mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* -- B2B CORPORATE CTA ----------------------------------- */}
        <section className="py-24 bg-gradient-to-br from-[hsl(213,55%,15%)] via-[hsl(213,55%,23%)] to-[hsl(213,40%,30%)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(199,89%,48%)] opacity-10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
                  <Briefcase className="w-4 h-4 text-[hsl(199,89%,65%)]" />
                  <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">B2B Corporate Solutions</span>
                </div>

                <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
                  Corporate Employee{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(199,89%,65%)] to-[hsl(199,89%,80%)]">
                    Relocation Management
                  </span>
                </h2>

                <p className="text-white/75 text-lg mb-10 max-w-2xl mx-auto">
                  End-to-end relocation solutions for HR & Talent Mobility Teams. Eliminate relocation chaos, control costs, and deliver a smooth employee experience.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <SectionCTA
                    title=""
                    subtitle=""
                    primaryText="Explore B2B Corporate Services"
                    primaryHref="/services/corporate-services"
                    secondaryText="Contact Sales"
                    secondaryHref="/contact"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {["Centralized Billing", "Employee Dashboard", "Policy Execution", "Global Coverage", "Dedicated Account Manager"].map(feat => (
                    <div key={feat} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(199,89%,65%)] flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <SectionCTA
          title="Ready to Move?"
          subtitle="Get a free, no-obligation quote from India's most trusted relocation partner."
          primaryText="Get Free Quote"
          primaryHref="/quote"
          secondaryText="View All Services"
          secondaryHref="/services"
        />
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default ServicesPage;
