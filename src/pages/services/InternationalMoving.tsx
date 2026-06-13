import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Globe, 
  Plane, 
  Ship, 
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Package,
  Shield,
  Star,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-international.webp";

const features = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Partner network spanning 150+ countries for seamless international moves."
  },
  {
    icon: FileCheck,
    title: "Customs Clearance",
    description: "Complete documentation and customs handling for hassle-free shipping."
  },
  {
    icon: Ship,
    title: "Sea & Air Freight",
    description: "Flexible shipping options via sea or air based on your timeline and budget."
  },
  {
    icon: Shield,
    title: "International Insurance",
    description: "Comprehensive coverage for your belongings during international transit."
  }
];

const destinations = [
  { country: "USA", flag: "🇺🇸", time: "4-6" },
  { country: "UK", flag: "🇬🇧", time: "3-4" },
  { country: "Canada", flag: "🇨🇦", time: "4-6" },
  { country: "Australia", flag: "🇦🇺", time: "4-5" },
  { country: "UAE", flag: "🇦🇪", time: "1-2" },
  { country: "Singapore", flag: "🇸🇬", time: "2-3" }
];

const services = [
  "Door-to-door international moving",
  "Full container loads (FCL)",
  "Less than container loads (LCL)",
  "Air freight services",
  "Customs brokerage",
  "Export packing & crating",
  "Vehicle shipping",
  "Pet relocation assistance"
];

const process = [
  { step: 1, title: "Pre-Move Survey", description: "Virtual or in-person assessment of your belongings" },
  { step: 2, title: "Documentation", description: "Complete paperwork and customs documentation" },
  { step: 3, title: "Export Packing", description: "International-grade packing and crating" },
  { step: 4, title: "Shipping", description: "Sea or air freight as per your choice" },
  { step: 5, title: "Destination Services", description: "Customs clearance and delivery at destination" }
];

const InternationalMoving = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="International"
          highlightedText="Moving"
          description="Relocate anywhere in the world with our trusted international moving services. Complete door-to-door solutions with customs clearance."
          badgeText="Home Relocation Services"
          badgeIcon={Globe}
          heroImage={heroImage}
          ctaText="Get Free Quote"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">1K+</div>
                <div className="text-secondary-foreground/80 text-sm">International Moves</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Globally</div>
                <div className="text-secondary-foreground/80 text-sm">Served</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Personal</div>
                <div className="text-secondary-foreground/80 text-sm">Transport</div>
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
                Professional International Moving Services for Global Relocations
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving to another country is one of life's most significant transitions, filled with both excitement and complexity. At Panya Global, we specialize in international moving services that make your global relocation smooth, secure, and stress-free. With experience in handling moves to 150+ countries worldwide, we understand the unique challenges of international relocations and provide comprehensive solutions tailored to your specific destination and needs.
                </p>

                <p>
                  International moving involves much more than just transporting your belongings across borders. It requires navigating complex customs regulations, understanding import restrictions, managing extensive documentation, and coordinating logistics across multiple countries and time zones. Our international moving experts handle all these complexities for you, ensuring compliance with both origin and destination country requirements while keeping your move on schedule and within budget.
                </p>

                <p>
                  We offer complete door-to-door international moving services that cover every aspect of your relocation. From the initial consultation and pre-move survey to final delivery and unpacking at your new home, our team manages the entire process with attention to detail and personalized care. We work closely with you to understand your specific requirements, timeline, and budget, then create a customized moving plan that addresses all your needs.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive International Shipping Solutions</h3>
                
                <p>
                  We provide flexible shipping options to accommodate different timelines and budgets. For time-sensitive moves, our air freight services offer the fastest delivery times, typically 3-7 days depending on the destination. For more cost-effective solutions, our sea freight services provide economical rates with delivery times ranging from 2-6 weeks, depending on the route and destination.
                </p>

                <p>
                  We offer both Full Container Load (FCL) and Less than Container Load (LCL) options for sea freight, allowing you to choose the most suitable and cost-effective solution based on the volume of your shipment. Our export packing and crating services use international-grade materials and techniques to ensure your belongings are protected during the extended journey and multiple handling points involved in international shipping.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Expert Customs and Documentation Services</h3>
                
                <p>
                  Navigating customs regulations is one of the most challenging aspects of international moving. Our customs brokerage services handle all the complex documentation, import/export requirements, and customs clearance procedures on your behalf. We ensure all paperwork is completed accurately and submitted on time to avoid delays or additional fees.
                </p>

                <p>
                  Our team stays updated on changing international shipping regulations and import restrictions for different countries. We provide guidance on what items can and cannot be shipped to your destination, helping you avoid potential issues with customs authorities. We also assist with obtaining necessary permits and licenses that may be required for certain items or for moving to specific countries.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Destination Services and Support</h3>
                
                <p>
                  Our international moving services extend beyond just transportation. We provide comprehensive destination services including customs clearance at your new location, delivery to your new home, and unpacking assistance. Our global network of trusted partners ensures you receive the same high level of service and care at your destination as you did at your origin.
                </p>

                <p>
                  We also offer additional services such as temporary storage, vehicle shipping, and pet relocation assistance to make your international move as complete and convenient as possible. Our goal is to provide a seamless relocation experience that allows you to focus on settling into your new life rather than worrying about logistics and paperwork.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Insurance and Peace of Mind</h3>
                
                <p>
                  We understand that your belongings represent years of memories and investments. That's why we offer comprehensive international moving insurance coverage that protects your possessions throughout the entire journey. Our insurance options provide financial protection against damage, loss, or theft during international transit, giving you peace of mind during your relocation.
                </p>

                <p>
                  Don't let the complexity of international moving overwhelm you. Contact Panya Global today to learn more about our comprehensive international moving services and let our experienced team handle your global relocation with professionalism and care. We're here to make your international move as smooth and stress-free as possible, so you can focus on the exciting new chapter ahead.
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
                Why Choose Our <span className="text-secondary">International Moving</span> Service?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Moving abroad is a significant decision. We make it seamless with our expert international relocation services.
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

        {/* Popular Destinations */}
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
                Popular <span className="text-secondary">Destinations</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide international moving services to all major countries worldwide.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {destinations.map((dest, index) => (
                <motion.div
                  key={dest.country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{dest.flag}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {dest.country}
                  </h3>
                  <p className="text-secondary text-sm font-medium">
                    {dest.time}
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
                Our <span className="text-secondary">International Moving</span> Process
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A streamlined 5-step process for stress-free international relocation.
              </p>
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

        {/* Services & CTA */}
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
                  Comprehensive International Moving Services
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
                  Ready to Move Abroad?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get a customized quote for your international relocation. Our experts will guide you through every step.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/quote">
                    <Button size="lg" variant="hero" className="gap-2">
                      Get Free Quote
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="tel:+911141556447">
                    <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      Call Now
                    </Button>
                  </a>
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

export default InternationalMoving;
