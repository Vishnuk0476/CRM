import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Monitor,
  FileText,
  Boxes,
  Tv,
  Factory,
  Store,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Phone,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import CostCalculator from "@/components/workspace/CostCalculator";
import RelocationChecklist from "@/components/workspace/RelocationChecklist";
import SiteSurveyBooking from "@/components/workspace/SiteSurveyBooking";
import WorkspaceFAQ from "@/components/workspace/WorkspaceFAQ";
import VerticalTimeline from "@/components/workspace/VerticalTimeline";

const workspaceServices = [
  {
    icon: Building2,
    title: "Office Furniture Moving",
    description: "Desks, chairs, cubicles, conference tables, and ergonomic equipment professionally handled.",
    features: ["Disassembly & reassembly", "Protective wrapping", "Placement as per layout"],
  },
  {
    icon: Monitor,
    title: "IT Equipment & Server Relocation",
    description: "Safe transport of computers, servers, networking equipment, and data center infrastructure.",
    features: ["Anti-static packaging", "Cable management", "System reconnection"],
  },
  {
    icon: FileText,
    title: "Document & File Management",
    description: "Secure packing and transport of confidential documents, archives, and records.",
    features: ["Tamper-proof sealing", "Inventory tracking", "Organized unpacking"],
  },
  {
    icon: Boxes,
    title: "Modular Furniture Systems",
    description: "Expert dismantling and reassembly of modular office partitions and workstations.",
    features: ["Panel tracking", "Hardware organization", "Layout optimization"],
  },
  {
    icon: Tv,
    title: "Electronics & AV Equipment",
    description: "Projectors, display screens, sound systems, and telecom equipment carefully relocated.",
    features: ["Calibration support", "Mounting assistance", "Testing post-move"],
  },
  {
    icon: Factory,
    title: "Warehouse & Factory Shifting",
    description: "Heavy machinery, industrial equipment, and inventory relocation with specialized handling.",
    features: ["Crane & rigging", "Floor protection", "Safety compliance"],
  },
  {
    icon: Store,
    title: "Retail Store Relocation",
    description: "Display units, POS systems, inventory, and signage moved with minimal business disruption.",
    features: ["Quick turnaround", "Inventory management", "Visual merchandising"],
  },
  {
    icon: Users,
    title: "Co-working & Startup Setup",
    description: "Complete setup assistance for new workspace locations including furniture and IT.",
    features: ["Space planning", "Vendor coordination", "Day-one readiness"],
  },
];

const caseStudies = [
  {
    company: "TechCorp India Pvt. Ltd.",
    industry: "IT Services",
    employees: "250+",
    location: "Mumbai to Navi Mumbai",
    challenge: "Relocate entire 15,000 sq ft office over a weekend with zero data loss and minimal Monday downtime.",
    solution:
      "Deployed 40-member specialized team with IT experts. Pre-labeled all equipment, used anti-static containers for servers, and completed move in 48 hours.",
    result: "100% uptime maintained. All 250 workstations operational by Monday 8 AM.",
    testimonial:
      "Panya Global made our office move feel effortless. Their IT team handled our servers with exceptional care, and we didn't lose a single minute of productivity.",
    author: "Rajesh Kumar",
    position: "CTO, TechCorp India",
    rating: 5,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
  },
  {
    company: "Global Banking Solutions",
    industry: "BFSI",
    employees: "500+",
    location: "Delhi to Gurugram",
    challenge:
      "Move headquarters with strict compliance requirements for sensitive financial documents and secure servers.",
    solution:
      "Implemented chain-of-custody documentation, GPS-tracked vehicles, armed escorts for document transport, and certified data handling procedures.",
    result: "Zero security incidents. Full regulatory compliance maintained throughout transition.",
    testimonial:
      "The level of security and professionalism from Panya Global exceeded our stringent compliance requirements. They understood the sensitivity of our operations perfectly.",
    author: "Priya Sharma",
    position: "COO, Global Banking Solutions",
    rating: 5,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
  },
  {
    company: "Creative Studios",
    industry: "Media & Entertainment",
    employees: "80+",
    location: "Bangalore Intra-City",
    challenge:
      "Relocate high-value production equipment including editing suites, cameras, and sound stage infrastructure.",
    solution:
      "Custom crating for sensitive equipment, climate-controlled transport for film archives, and specialized handling for studio lighting rigs.",
    result: "All equipment operational within 72 hours. No damage to ₹2Cr+ worth of production gear.",
    testimonial:
      "Our production equipment is worth crores, and Panya Global treated every piece like it was priceless. Their attention to detail saved us weeks of potential recalibration.",
    author: "Vikram Mehta",
    position: "Founder, Creative Studios",
    rating: 5,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=500&fit=crop",
  },
  {
    company: "HealthCare Plus",
    industry: "Healthcare",
    employees: "350+",
    location: "Chennai Multi-Location",
    challenge: "Relocate medical equipment, patient records, and diagnostic labs while maintaining patient services.",
    solution:
      "Staggered relocation plan, specialized medical equipment handling, and compliant document migration with full chain of custody.",
    result: "Patient services uninterrupted, all medical equipment certified and operational.",
    testimonial:
      "Moving a healthcare facility is incredibly complex. Panya Global's healthcare relocation specialists understood our regulatory requirements and executed flawlessly.",
    author: "Dr. Anitha Rajan",
    position: "Director, HealthCare Plus",
    rating: 5,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
  },
  {
    company: "StartUp Hub Co-Working",
    industry: "Real Estate",
    employees: "50+ Companies",
    location: "Pune Expansion",
    challenge: "Set up new co-working space while relocating existing tenants with minimal disruption.",
    solution: "Individual company coordination, modular furniture assembly, and phased tenant migration over weekends.",
    result: "All 50+ companies relocated successfully, new space operational ahead of schedule.",
    testimonial:
      "Coordinating moves for 50 different companies seemed impossible. Panya Global's project management was exceptional - every company was handled individually yet efficiently.",
    author: "Amit Patel",
    position: "CEO, StartUp Hub",
    rating: 5,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=500&fit=crop",
  },
  {
    company: "Legal Associates LLP",
    industry: "Legal Services",
    employees: "120+",
    location: "Hyderabad",
    challenge: "Move confidential case files, legal libraries, and client documentation with strict chain of custody.",
    solution:
      "Secure document handling protocols, individual file tracking, and attorney-supervised packing of sensitive materials.",
    result: "100% document accountability, zero confidentiality breaches, law firm fully operational in 48 hours.",
    testimonial:
      "Confidentiality is everything in legal practice. Panya Global's document security protocols gave us complete peace of mind throughout the relocation.",
    author: "Advocate Suresh Reddy",
    position: "Senior Partner, Legal Associates LLP",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Minimal Downtime",
    description: "Weekend and after-hours moves to keep your business running",
  },
  { icon: Shield, title: "Fully Insured", description: "Comprehensive coverage for all equipment and assets" },
  { icon: Truck, title: "Specialized Fleet", description: "Vehicles equipped for office and IT equipment transport" },
  { icon: Users, title: "Trained Teams", description: "IT-certified and security-cleared professionals" },
];

const WorkspaceRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-semibold mb-6">
                Workspace Relocation Experts
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Move Your <span className="text-secondary">Workspace</span> Without Missing a Beat
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                From small offices to large corporate headquarters, we handle every aspect of your workspace relocation
                with minimal downtime and maximum efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quote">
                  <Button variant="hero" size="lg">
                    Get Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:+911141556447">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Phone className="w-5 h-5" />
                    Call: +91 11 41556447
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Strip */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-secondary-foreground"
                >
                  <benefit.icon className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{benefit.title}</p>
                    <p className="text-xs opacity-80 hidden sm:block">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                What We Move
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Complete <span className="text-secondary">Workspace Moving</span> Solutions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every aspect of your workspace handled by trained professionals with specialized equipment.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workspaceServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Animated Vertical Timeline */}
        <VerticalTimeline />

        {/* Case Studies with Testimonials */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                Success Stories
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Case <span className="text-secondary">Studies</span> & Testimonials
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real results from real clients - see how we've transformed workspace relocations across industries.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.company}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-secondary/30 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={study.image}
                      alt={study.company}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-secondary">{study.industry}</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{study.company}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                        {study.employees} Employees
                      </span>
                      <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                        {study.location}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-destructive mb-1">Challenge:</h4>
                        <p className="text-sm text-muted-foreground">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-secondary mb-1">Solution:</h4>
                        <p className="text-sm text-muted-foreground">{study.solution}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Result:</h4>
                        <p className="text-sm text-foreground font-medium">{study.result}</p>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-1 mb-3">
                        {[...Array(study.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                        ))}
                      </div>
                      <div className="relative">
                        <Quote className="absolute -top-1 -left-1 w-6 h-6 text-secondary/20" />
                        <p className="text-muted-foreground italic pl-5 text-sm leading-relaxed">
                          "{study.testimonial}"
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                          <span className="text-secondary font-semibold text-sm">
                            {study.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{study.author}</p>
                          <p className="text-xs text-muted-foreground">{study.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Section - Calculator & Checklist */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                Free Tools
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Plan Your <span className="text-secondary">Move</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Use our free tools to estimate costs and stay organized throughout your relocation journey.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <CostCalculator />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <RelocationChecklist />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Site Survey Booking */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                Free Site Survey
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Book Your <span className="text-secondary">Free Survey</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our experts will visit your location to assess and plan your workspace relocation at no cost.
              </p>
            </motion.div>
            <div className="max-w-3xl mx-auto">
              <SiteSurveyBooking />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <WorkspaceFAQ />

        {/* Stats Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Workspaces Relocated" },
                { value: "99.8%", label: "On-Time Delivery" },
                { value: "100K+", label: "Employees Transitioned" },
                { value: "4.9/5", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{stat.value}</div>
                  <div className="text-primary-foreground/80 text-sm md:text-base">{stat.label}</div>
                </motion.div>
              ))}
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

export default WorkspaceRelocation;
