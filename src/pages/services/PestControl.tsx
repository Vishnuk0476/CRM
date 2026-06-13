import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Bug, 
  Shield, 
  Leaf, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Home,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-pest-control.webp";

const features = [
  {
    icon: Shield,
    title: "Safe Products",
    description: "WHO-approved, child and pet-safe chemicals."
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Environment-friendly pest control solutions."
  },
  {
    icon: Clock,
    title: "Quick Service",
    description: "Same-day service available in most areas."
  },
  {
    icon: Bug,
    title: "Complete Elimination",
    description: "Guaranteed pest removal with warranty."
  }
];

const pestTypes = [
  { type: "Cockroaches", icon: "🪳", description: "Complete elimination" },
  { type: "Termites", icon: "🐛", description: "Anti-termite treatment" },
  { type: "Bedbugs", icon: "🐜", description: "Bedbug control" },
  { type: "Rodents", icon: "🐀", description: "Rat & mice control" },
  { type: "Mosquitoes", icon: "🦟", description: "Mosquito fogging" },
  { type: "General Pests", icon: "🕷️", description: "All common pests" }
];

const services = [
  "Pre-move pest control",
  "Post-move sanitization",
  "Termite treatment",
  "General pest control",
  "Kitchen pest control",
  "Rodent control",
  "Annual maintenance contracts",
  "Commercial pest control"
];

const PestControl = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Pest Control"
          highlightedText="Services"
          description="Professional pest control for your new home. Ensure a clean, pest-free living space before you move in."
          badgeText="Additional Services"
          badgeIcon={Bug}
          heroImage={heroImage}
          ctaText="Book Service"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0</div>
                <div className="text-secondary-foreground/80 text-sm">Cases Handled</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0</div>
                <div className="text-secondary-foreground/80 text-sm">Customer Reviews</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0</div>
                <div className="text-secondary-foreground/80 text-sm">Service Areas</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0</div>
                <div className="text-secondary-foreground/80 text-sm flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Content Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
                Professional Pest Control Services for a Healthy Home
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Welcome to Panya Global's comprehensive pest control services, where we provide expert solutions to keep your home and workplace free from unwanted pests. Our professional pest control team is dedicated to delivering effective, safe, and long-lasting pest management solutions tailored to your specific needs. Whether you're dealing with common household pests or require specialized treatment, our experienced technicians use the latest techniques and environmentally responsible products to ensure your complete satisfaction.
                </p>

                <p>
                  Pest infestations can be more than just a nuisance - they can pose serious health risks and cause significant property damage. Cockroaches can trigger allergies and asthma, termites can compromise the structural integrity of your home, and rodents can contaminate food and spread diseases. That's why it's crucial to address pest problems promptly and professionally. Our comprehensive pest control services are designed to identify the root cause of infestations and implement effective solutions that prevent future problems.
                </p>

                <p>
                  We understand that every pest problem is unique, which is why we offer customized treatment plans based on thorough inspections and assessments. Our approach combines advanced pest control methods with preventive strategies to ensure long-term protection for your property. From initial consultation to follow-up visits, our team is committed to providing exceptional service and peace of mind.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Our Comprehensive Pest Control Approach</h3>
                
                <p>
                  At Panya Global, we follow a systematic approach to pest control that ensures effective results and customer satisfaction. Our process begins with a detailed inspection of your property to identify the type and extent of the infestation. We examine potential entry points, nesting areas, and conditions that may be attracting pests to your home or business.
                </p>

                <p>
                  Based on our findings, we develop a customized treatment plan that addresses both the immediate pest problem and underlying causes. Our technicians use integrated pest management (IPM) techniques that combine multiple control methods for maximum effectiveness while minimizing environmental impact. This approach includes targeted treatments, exclusion techniques, and recommendations for preventing future infestations.
                </p>

                <p>
                  We believe in transparency and education, so we take the time to explain our treatment methods and answer any questions you may have. Our goal is not only to eliminate your current pest problem but also to empower you with knowledge and strategies to maintain a pest-free environment.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Safe and Effective Treatment Methods</h3>
                
                <p>
                  Your safety and the safety of your family, pets, and the environment are our top priorities. We use only WHO-approved, child and pet-safe chemicals that are effective against pests while minimizing risks to humans and animals. Our technicians are trained in proper application techniques to ensure treatments are applied safely and effectively.
                </p>

                <p>
                  We offer a range of treatment options to suit different needs and preferences. For environmentally conscious customers, we provide eco-friendly solutions that use natural ingredients and non-toxic methods. For more severe infestations, we have access to professional-grade products that are not available to the general public but are applied with precision and care.
                </p>

                <p>
                  Our commitment to safety extends beyond chemical treatments. We also employ physical control methods such as sealing entry points, installing barriers, and using traps when appropriate. These methods reduce the need for chemical applications while providing effective long-term solutions.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Preventive Measures and Maintenance</h3>
                
                <p>
                  The best pest control is prevention. That's why we emphasize the importance of ongoing maintenance and preventive measures to keep your property pest-free. Our technicians provide personalized recommendations for eliminating conditions that attract pests, such as food sources, water leaks, and clutter.
                </p>

                <p>
                  We offer annual maintenance contracts that include regular inspections and preventive treatments to catch potential problems early. These programs are particularly beneficial for businesses, rental properties, and homes in areas prone to specific pest problems. Regular maintenance not only prevents infestations but also helps identify and address issues before they become major problems.
                </p>

                <p>
                  Our team also provides guidance on proper sanitation practices, storage methods, and home maintenance to reduce the likelihood of pest problems. Simple changes in daily habits and property maintenance can significantly reduce the risk of infestations and the need for chemical treatments.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Customer Satisfaction Guaranteed</h3>
                
                <p>
                  We stand behind the quality of our work with a satisfaction guarantee. If you're not completely satisfied with our pest control services, we'll work with you to make it right. Our commitment to excellence extends beyond the initial treatment - we provide follow-up visits when needed and are always available to answer questions or address concerns.
                </p>

                <p>
                  Our technicians are not only skilled in pest control techniques but also trained in customer service. They arrive on time, respect your property, and communicate clearly throughout the process. We believe that exceptional service is just as important as effective pest control.
                </p>

                <p>
                  Don't let pests compromise your comfort, health, or property. Contact Panya Global today to schedule a consultation and take the first step toward a pest-free environment. Our professional team is ready to provide you with the expert pest control solutions you need for lasting peace of mind.
                </p>
              </div>
            </motion.div>
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
                Why Choose Our <span className="text-secondary">Pest Control</span>?
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

        {/* Pest Types */}
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
                Pests We <span className="text-secondary">Control</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pestTypes.map((pest, index) => (
                <motion.div
                  key={pest.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{pest.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {pest.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {pest.description}
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
                  Our Pest Control Services
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
                  Moving to a New Home?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Book pest control before moving in for a clean, healthy living space.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Book Service
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

export default PestControl;
