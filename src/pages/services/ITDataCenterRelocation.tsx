import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Server, 
  Shield, 
  Cpu, 
  Network,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-it-datacenter.webp";

const features = [
  {
    icon: Shield,
    title: "Data Security",
    description: "Strict protocols to ensure data integrity during the move."
  },
  {
    icon: Cpu,
    title: "Expert Technicians",
    description: "Certified IT professionals handle all equipment."
  },
  {
    icon: Network,
    title: "Network Setup",
    description: "Complete network reconfiguration at the new location."
  },
  {
    icon: Clock,
    title: "WFH Asset Delivery",
    description: "4500+ laptops & assets moved and delivered for WFH setups."
  }
];

const equipment = [
  { type: "Servers", icon: "🖥️", description: "Rack & tower servers" },
  { type: "Network", icon: "🌐", description: "Switches, routers & firewalls" },
  { type: "Storage", icon: "💾", description: "SAN, NAS & backup systems" },
  { type: "Workstations", icon: "💻", description: "Desktops & laptops" },
  { type: "UPS/Power", icon: "🔌", description: "Power infrastructure" },
  { type: "Telecom", icon: "📞", description: "PBX & VoIP systems" }
];

const services = [
  "Server room relocation",
  "Data center migration",
  "Network infrastructure moving",
  "Workstation packing & setup",
  "Cable management",
  "Equipment inventory & labeling",
  "Testing & validation",
  "Post-move support"
];

const ITDataCenterRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="IT & Data Center"
          highlightedText="Relocation"
          description="Expert handling of your critical IT infrastructure. Secure, efficient migration with minimal downtime."
          badgeText="Workplace Relocation"
          badgeIcon={Server}
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
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100+</div>
                <div className="text-secondary-foreground/80 text-sm">Data Centers Moved</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0%</div>
                <div className="text-secondary-foreground/80 text-sm">Data Loss Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">4500</div>
                <div className="text-secondary-foreground/80 text-sm">Laptops & Assets Delivered for WFH</div>
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
                Why Choose Our <span className="text-secondary">IT Relocation</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your IT infrastructure is critical. We treat it with the expertise it deserves.
              </p>
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

        {/* Equipment Types */}
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
                Equipment We <span className="text-secondary">Handle</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {equipment.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {item.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {item.description}
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
                  Complete IT Relocation Services
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
                  Moving Your Data Center?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get expert consultation and a customized migration plan.
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

        <CTA />
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default ITDataCenterRelocation;
