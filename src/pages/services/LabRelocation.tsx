import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FlaskConical, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Star,
  Thermometer,
  AlertTriangle,
  Microscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-lab.webp";

import labBefore1 from "@/assets/lab-before-1.webp";
import labAfter1 from "@/assets/lab-after-1.webp";
import labBefore2 from "@/assets/lab-before-2.webp";
import labAfter2 from "@/assets/lab-after-2.webp";

const features = [
  {
    icon: Microscope,
    title: "Precision Handling",
    description: "Specialized handling for sensitive lab instruments."
  },
  {
    icon: Thermometer,
    title: "Temperature Control",
    description: "Climate-controlled transport for samples and reagents."
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description: "ISO, GLP, and GMP compliant relocation processes."
  },
  {
    icon: Clock,
    title: "Zero Downtime",
    description: "Phased approach to minimize research interruption."
  }
];

const labTypes = [
  { type: "Research Labs", icon: "🔬", description: "Academic & private research" },
  { type: "Diagnostic Labs", icon: "🧪", description: "Clinical testing facilities" },
  { type: "Pharmaceutical", icon: "💊", description: "Drug development labs" },
  { type: "Biotech Labs", icon: "🧬", description: "Biotechnology facilities" },
  { type: "Chemical Labs", icon: "⚗️", description: "Chemical analysis labs" },
  { type: "Quality Control", icon: "✅", description: "QC testing laboratories" }
];

const services = [
  "Sensitive equipment relocation",
  "Fume hood disassembly & setup",
  "Chemical & sample transport",
  "Cold storage transfer",
  "Biosafety cabinet moving",
  "Lab bench installation",
  "Utility connection coordination",
  "Documentation & compliance"
];

const process = [
  { step: "01", title: "Survey", description: "Detailed lab assessment and inventory" },
  { step: "02", title: "Planning", description: "Customized relocation timeline" },
  { step: "03", title: "Packing", description: "Specialized equipment packaging" },
  { step: "04", title: "Setup", description: "Installation and calibration" }
];

const LabRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Laboratory"
          highlightedText="Relocation"
          description="Expert relocation services for research, diagnostic, and pharmaceutical laboratories. Precision handling guaranteed."
          badgeText="Workplace Relocation"
          badgeIcon={FlaskConical}
          heroImage={heroImage}
          ctaText="Get Free Quote"
          phoneNumber="+91 11 4155 6447"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">500</div>
                <div className="text-secondary-foreground/80 text-sm">Cr+ Worth Assets</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">75+</div>
                <div className="text-secondary-foreground/80 text-sm">Labs Relocated</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100%</div>
                <div className="text-secondary-foreground/80 text-sm">Safe Delivery</div>
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
                Why Choose Our <span className="text-secondary">Lab Relocation</span>?
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

        {/* Lab Types */}
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
                Laboratories We <span className="text-secondary">Relocate</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {labTypes.map((lab, index) => (
                <motion.div
                  key={lab.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{lab.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {lab.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {lab.description}
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
                  Lab Moving Services
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
                  Planning a Laboratory Move?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get expert consultation for your laboratory relocation needs.
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

        {/* Gallery Section */}
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
                Before & After <span className="text-secondary">Gallery</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See the precision and care we bring to every laboratory relocation project.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                { 
                  title: "Research Lab Setup", 
                  beforeImg: labBefore1, 
                  afterImg: labAfter1,
                  before: "Lab equipment organized and ready for relocation", 
                  after: "Fully set up in new modern facility with improved layout" 
                },
                { 
                  title: "Laboratory Equipment Handling", 
                  beforeImg: labBefore2, 
                  afterImg: labAfter2,
                  before: "Professional team carefully packing sensitive equipment", 
                  after: "State-of-the-art lab with all equipment installed and calibrated" 
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-500"
                >
                  <div className="p-4">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-4 text-center">{item.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-destructive/10 text-destructive rounded mb-2">Before</span>
                        <div className="aspect-video rounded-lg overflow-hidden mb-2">
                          <img src={item.beforeImg} alt={`${item.title} - Before`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                        <p className="text-xs text-muted-foreground">{item.before}</p>
                      </div>
                      <div>
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-secondary/10 text-secondary rounded mb-2">After</span>
                        <div className="aspect-video rounded-lg overflow-hidden mb-2">
                          <img src={item.afterImg} alt={`${item.title} - After`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                        <p className="text-xs text-muted-foreground">{item.after}</p>
                      </div>
                    </div>
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

export default LabRelocation;
