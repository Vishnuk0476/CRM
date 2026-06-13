import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  Server, 
  Users, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Boxes
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-office-relocation.webp";

const features = [
  {
    icon: Clock,
    title: "Minimal Downtime",
    description: "Weekend and after-hours moves to keep your business running."
  },
  {
    icon: Server,
    title: "IT Infrastructure",
    description: "Specialized handling of servers, networks, and tech equipment."
  },
  {
    icon: Users,
    title: "Project Management",
    description: "Dedicated move coordinator for seamless execution."
  },
  {
    icon: Shield,
    title: "Easy Cover",
    description: "Coverage options for office equipment and assets during transit."
  }
];

const officeTypes = [
  { type: "Corporate HQ", icon: "🏢", description: "Large corporate moves" },
  { type: "IT Companies", icon: "💻", description: "Tech office relocation" },
  { type: "Startups", icon: "🚀", description: "Agile workspace moves" },
  { type: "Co-working", icon: "🤝", description: "Shared space setup" },
  { type: "Banks/Finance", icon: "🏦", description: "Financial institutions" },
  { type: "Government", icon: "🏛️", description: "Public sector offices" }
];

const services = [
  "Office furniture moving",
  "IT & server relocation",
  "Workstation setup",
  "Document & file management",
  "Asset tracking & inventory",
  "Furniture installation",
  "Space planning support",
  "After-hours moving"
];

const process = [
  { step: 1, title: "Site Survey", description: "Assess current and new office spaces" },
  { step: 2, title: "Planning", description: "Detailed move plan with timelines" },
  { step: 3, title: "Packing", description: "Systematic labeling and packing" },
  { step: 4, title: "Moving", description: "Efficient transport and handling" },
  { step: 5, title: "Setup", description: "Complete installation at new location" }
];

const OfficeRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Office"
          highlightedText="Relocation"
          description="Seamless office moves with minimal business disruption. We handle everything from cubicles to server rooms."
          badgeText="Workplace Relocation"
          badgeIcon={Building2}
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
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">1500+</div>
                <div className="text-secondary-foreground/80 text-sm">Offices Moved</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100%</div>
                <div className="text-secondary-foreground/80 text-sm">Accurate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Easy</div>
                <div className="text-secondary-foreground/80 text-sm">Cover</div>
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
                Why Choose Our <span className="text-secondary">Office Relocation</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                15+ years of experience in corporate moves with zero business disruption guarantee.
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

        {/* Office Types */}
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
                We Move <span className="text-secondary">All Office Types</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From startups to corporate headquarters, we have specialized solutions.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {officeTypes.map((office, index) => (
                <motion.div
                  key={office.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{office.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {office.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {office.description}
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
                Our <span className="text-secondary">Office Move</span> Process
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {process.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {step.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
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
                  Comprehensive Office Moving Services
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
                  Ready to Move Your Office?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get a customized quote for your office relocation. We ensure zero downtime.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/quote">
                    <Button size="lg" variant="hero" className="gap-2">
                      Get Free Quote
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
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

export default OfficeRelocation;
