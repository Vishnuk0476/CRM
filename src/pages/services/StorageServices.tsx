import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Warehouse, 
  Shield, 
  Thermometer, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Lock,
  Eye,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-storage.webp";

const features = [
  {
    icon: Lock,
    title: "Secure Facilities",
    description: "24/7 security surveillance and access control systems."
  },
  {
    icon: Thermometer,
    title: "Climate Controlled",
    description: "Temperature and humidity controlled storage for sensitive items."
  },
  {
    icon: Eye,
    title: "CCTV Monitoring",
    description: "Round-the-clock video surveillance for complete safety."
  },
  {
    icon: Clock,
    title: "Flexible Duration",
    description: "Short-term to long-term storage options available."
  }
];

const storageTypes = [
  { type: "Household", icon: "🏠", description: "Furniture & appliances" },
  { type: "Commercial", icon: "🏢", description: "Office equipment & files" },
  { type: "Vehicle", icon: "🚗", description: "Cars, bikes & more" },
  { type: "Documents", icon: "📁", description: "Secure file storage" },
  { type: "Fine Art", icon: "🖼️", description: "Artwork & antiques" },
  { type: "Seasonal", icon: "📦", description: "Short-term storage" }
];

const services = [
  "Residential storage solutions",
  "Commercial warehousing",
  "Document storage & archiving",
  "Vehicle storage facilities",
  "Climate-controlled units",
  "Inventory management",
  "Pick-up & delivery service",
  "Easy Cover options"
];

const StorageServices = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Storage"
          highlightedText="Services"
          description="Secure, climate-controlled storage facilities for all your belongings. Flexible plans for short-term and long-term needs."
          badgeText="Home Relocation Services"
          badgeIcon={Warehouse}
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
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">15K+</div>
                <div className="text-secondary-foreground/80 text-sm">Sq ft Storage Facility</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">10+</div>
                <div className="text-secondary-foreground/80 text-sm">Locations</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Easy</div>
                <div className="text-secondary-foreground/80 text-sm">Cover Warranty</div>
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
                Professional Storage Services for Secure and Convenient Storage Solutions
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Finding reliable storage for your belongings requires more than just space—it requires security, climate control, and professional management. At Panya Global, we provide state-of-the-art storage facilities designed to keep your items safe, secure, and in perfect condition. Whether you need temporary storage during a move, long-term warehousing for business inventory, or secure document storage, our comprehensive storage solutions cater to all your needs with the highest standards of care and security.
                </p>

                <p>
                  Our storage facilities are equipped with advanced security systems including 24/7 surveillance, access control systems, and fire protection measures to ensure your belongings are protected at all times. We understand that your stored items represent valuable investments and cherished memories, which is why we maintain the highest security standards and employ trained security personnel to monitor our facilities around the clock.
                </p>

                <p>
                  We offer climate-controlled storage units that maintain optimal temperature and humidity levels to protect sensitive items such as electronics, artwork, antiques, documents, and furniture. This climate control prevents damage from moisture, mold, warping, and other environmental factors that can compromise the condition of your belongings during storage.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Storage Solutions for Every Need</h3>
                
                <p>
                  We provide a wide range of storage solutions to accommodate different requirements. For residential customers, we offer secure storage for household items, furniture, and personal belongings during moves, renovations, or when you simply need extra space. Our commercial storage services cater to businesses requiring warehousing for inventory, equipment, and documents, with flexible space options that can scale with your business needs.
                </p>

                <p>
                  We also specialize in vehicle storage, providing secure indoor facilities for cars, motorcycles, boats, and other vehicles. Our document storage and archiving services ensure your important papers and records are stored in secure, climate-controlled environments with proper indexing and retrieval systems for easy access when needed.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Flexible and Convenient Storage Options</h3>
                
                <p>
                  We understand that storage needs vary greatly from customer to customer. That's why we offer flexible storage plans that can be customized to your specific requirements and timeline. Whether you need storage for a few weeks, several months, or several years, we have options that accommodate your schedule and budget.
                </p>

                <p>
                  Our storage facilities are designed for maximum convenience with easy access, loading docks, and elevator access where needed. We also provide pick-up and delivery services to make storing and retrieving your items as convenient as possible. Our inventory management systems ensure your items are properly cataloged and easily located when you need them.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Professional Management and Customer Service</h3>
                
                <p>
                  Our storage facilities are managed by professional teams who are trained in proper handling techniques, inventory management, and customer service. We take pride in maintaining clean, organized, and well-maintained facilities that reflect our commitment to quality and customer satisfaction.
                </p>

                <p>
                  We offer Easy Cover options that provide additional protection for your stored items, giving you peace of mind knowing your belongings are covered against potential damage or loss. Our customer service team is available to assist you with any questions, provide facility tours, and help you choose the right storage solution for your needs.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Security and Peace of Mind</h3>
                
                <p>
                  Security is our top priority. Our facilities feature multiple layers of security including perimeter fencing, electronic access control, 24/7 video surveillance, and on-site security personnel. Each storage unit is individually secured with high-quality locks, and access is restricted to authorized personnel only.
                </p>

                <p>
                  Don't compromise on the safety and condition of your belongings. Contact Panya Global today to learn more about our professional storage services and let our experienced team provide you with secure, convenient, and reliable storage solutions that meet your specific needs. We're committed to delivering exceptional service and peace of mind for all your storage requirements.
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
                Why Choose Our <span className="text-secondary">Storage</span> Facilities?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                State-of-the-art storage facilities with maximum security and convenience.
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

        {/* Storage Types */}
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
                Storage <span className="text-secondary">Solutions</span> For Everything
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From household items to commercial inventory, we have the right storage solution.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {storageTypes.map((storage, index) => (
                <motion.div
                  key={storage.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{storage.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {storage.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {storage.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services List */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Complete <span className="text-secondary">Storage</span> Solutions
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you need temporary storage during a move or long-term warehousing, we have you covered.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <li key={service} className="flex items-center gap-3 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
                <Link to="/quote" className="mt-8 inline-block">
                  <Button size="lg" variant="hero" className="gap-2">
                    Get Storage Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop"
                  alt="Storage Services"
                  className="rounded-2xl shadow-2xl w-full"
                loading="lazy" decoding="async" />
                <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-lg">
                  <Warehouse className="w-8 h-8 mb-2" />
                  <div className="font-bold text-2xl">15K+</div>
                  <div className="text-sm">Sq.Ft Storage</div>
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

export default StorageServices;
