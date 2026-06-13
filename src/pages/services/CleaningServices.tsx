import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Home, 
  Clock, 
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Droplets,
  Wind
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-cleaning.webp";

const features = [
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    description: "Thorough cleaning of every corner of your home."
  },
  {
    icon: Shield,
    title: "Safe Products",
    description: "Eco-friendly, child and pet-safe cleaning agents."
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description: "Schedule at your convenience, including weekends."
  },
  {
    icon: Home,
    title: "All Spaces",
    description: "Kitchen, bathroom, bedroom, and common areas."
  }
];

const cleaningTypes = [
  { type: "Deep Clean", icon: "🧹", description: "Complete deep cleaning" },
  { type: "Move-In", icon: "📦", description: "Pre-occupancy cleaning" },
  { type: "Move-Out", icon: "🚚", description: "Post-vacating cleaning" },
  { type: "Kitchen", icon: "🍳", description: "Kitchen deep clean" },
  { type: "Bathroom", icon: "🚿", description: "Bathroom sanitization" },
  { type: "Carpet", icon: "🛋️", description: "Carpet & upholstery" }
];

const services = [
  "Pre-move deep cleaning",
  "Post-move sanitization",
  "Kitchen degreasing",
  "Bathroom descaling",
  "Floor mopping & polishing",
  "Window & glass cleaning",
  "Carpet shampooing",
  "Sofa & upholstery cleaning"
];

const CleaningServices = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Cleaning"
          highlightedText="Services"
          description="Professional cleaning for your old and new home. Move into a sparkling clean space."
          badgeText="Additional Services"
          badgeIcon={Sparkles}
          heroImage={heroImage}
          ctaText="Book Cleaning"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">10K+</div>
                <div className="text-secondary-foreground/80 text-sm">Homes Cleaned</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100+</div>
                <div className="text-secondary-foreground/80 text-sm">Trained Staff</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100%</div>
                <div className="text-secondary-foreground/80 text-sm">Eco-Friendly</div>
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
                Why Choose Our <span className="text-secondary">Cleaning</span>?
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

        {/* Cleaning Types */}
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
                Cleaning <span className="text-secondary">Options</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cleaningTypes.map((cleaning, index) => (
                <motion.div
                  key={cleaning.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{cleaning.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {cleaning.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {cleaning.description}
                  </p>
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
                  Our Cleaning Services
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
                  Moving Soon?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Book cleaning services for your old and new home.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Book Cleaning
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
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

export default CleaningServices;
