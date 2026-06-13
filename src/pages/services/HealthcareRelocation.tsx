import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Star,
  Truck,
  AlertTriangle,
  Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-healthcare.webp";

const features = [
  {
    icon: Shield,
    title: "Compliance Assured",
    description: "HIPAA & healthcare regulatory compliance throughout the move."
  },
  {
    icon: Clock,
    title: "Minimal Downtime",
    description: "Strategic planning to minimize operational disruption."
  },
  {
    icon: Thermometer,
    title: "Climate Controlled",
    description: "Temperature-sensitive equipment transport solutions."
  },
  {
    icon: AlertTriangle,
    title: "Risk Management",
    description: "Comprehensive insurance and liability coverage."
  }
];

const healthcareTypes = [
  { type: "Hospitals", icon: "🏥", description: "Full hospital relocations" },
  { type: "Clinics", icon: "🏪", description: "Medical clinics & practices" },
  { type: "Diagnostic Labs", icon: "🔬", description: "Testing laboratories" },
  { type: "Imaging Centers", icon: "📡", description: "MRI, CT, X-ray equipment" },
  { type: "Pharmacies", icon: "💊", description: "Pharmacy relocations" },
  { type: "Dental Offices", icon: "🦷", description: "Dental equipment moves" }
];

const services = [
  "Medical equipment relocation",
  "Hospital bed & furniture moving",
  "Laboratory equipment transport",
  "Imaging equipment installation",
  "Clean room setup & transfer",
  "Biomedical waste handling",
  "Electronic medical records migration",
  "Staff coordination & training"
];

const process = [
  { step: "01", title: "Assessment", description: "Detailed inventory and compliance review" },
  { step: "02", title: "Planning", description: "Custom relocation strategy development" },
  { step: "03", title: "Execution", description: "Professional packing and transport" },
  { step: "04", title: "Installation", description: "Equipment setup and verification" }
];

const HealthcareRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Healthcare"
          highlightedText="Relocation"
          description="Specialized relocation services for hospitals, clinics, and medical facilities. HIPAA compliant and regulatory assured."
          badgeText="Workplace Relocation"
          badgeIcon={Heart}
          heroImage={heroImage}
          ctaText="Get Free Quote"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">50+</div>
                <div className="text-secondary-foreground/80 text-sm">Healthcare Facilities</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100%</div>
                <div className="text-secondary-foreground/80 text-sm">Compliance Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">24/7</div>
                <div className="text-secondary-foreground/80 text-sm">Support Available</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">4.9</div>
                <div className="text-secondary-foreground/80 text-sm flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Our <span className="text-secondary">Healthcare Relocation</span>?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Healthcare Types */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Facilities We <span className="text-secondary">Serve</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {healthcareTypes.map((type, index) => (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {type.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {type.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our <span className="text-secondary">Process</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="text-6xl font-bold text-secondary/20 mb-4">{step.step}</div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                  Healthcare Moving Services
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <li key={service} className="flex items-center gap-3 text-primary-foreground">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center lg:text-left"
              >
                <h3 className="font-heading text-2xl font-bold text-primary-foreground mb-4">
                  Planning a Healthcare Facility Move?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get expert consultation for your medical facility relocation needs.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Get Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Healthcare Leaders <span className="text-secondary">Say</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted by hospitals, clinics, and medical facilities across India.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Rajesh Sharma",
                  role: "Hospital Administrator",
                  facility: "Apollo Hospitals, Delhi",
                  quote: "The team handled our MRI and CT equipment with exceptional care. Zero downtime during the entire transition. Highly professional service.",
                  rating: 5
                },
                {
                  name: "Dr. Priya Menon",
                  role: "Clinic Director",
                  facility: "Max Healthcare Clinic",
                  quote: "They understood our compliance requirements perfectly. Our diagnostic lab was operational within 48 hours of the move. Impressive!",
                  rating: 5
                },
                {
                  name: "Mr. Suresh Kumar",
                  role: "Operations Manager",
                  facility: "Fortis Medical Center",
                  quote: "Moving sensitive medical equipment requires expertise. Panya Global delivered beyond expectations. Our biomedical equipment was handled with utmost precision.",
                  rating: 5
                },
                {
                  name: "Dr. Anita Verma",
                  role: "Chief Medical Officer",
                  facility: "Medanta Hospital",
                  quote: "The coordination was flawless. They worked around our patient schedules and ensured minimal disruption. True professionals in healthcare relocation.",
                  rating: 5
                },
                {
                  name: "Mr. Vikram Singh",
                  role: "Facilities Manager",
                  facility: "AIIMS Extension",
                  quote: "From planning to execution, every step was meticulously handled. Our lab equipment calibration was verified post-move. Excellent service!",
                  rating: 5
                },
                {
                  name: "Dr. Meera Patel",
                  role: "Dental Clinic Owner",
                  facility: "SmileCare Dental",
                  quote: "Relocating dental chairs and X-ray machines seemed daunting, but Panya Global made it seamless. Our clinic was back in operation the very next day.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 italic">"{testimonial.quote}"</p>
                  <div className="border-t border-border pt-4">
                    <h4 className="font-heading font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-secondary">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.facility}</p>
                  </div>
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

export default HealthcareRelocation;
