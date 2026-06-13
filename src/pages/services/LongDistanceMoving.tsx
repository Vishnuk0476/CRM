import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Shield, 
  Route,
  CheckCircle2,
  ArrowRight,
  Truck,
  Navigation,
  Star,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-long-distance.webp";

const features = [
  {
    icon: Route,
    title: "Pan-India Coverage",
    description: "We cover all major cities and towns across India with our extensive network."
  },
  {
    icon: Navigation,
    title: "GPS Tracking",
    description: "Track your belongings in real-time throughout the journey."
  },
  {
    icon: Shield,
    title: "Transit Insurance",
    description: "Comprehensive insurance coverage for long-distance transportation."
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "Guaranteed delivery within the promised timeframe."
  }
];

const routes = [
  { from: "Delhi", to: "Mumbai", time: "3-4 Days" },
  { from: "Delhi", to: "Bangalore", time: "4-5 Days" },
  { from: "Delhi", to: "Chennai", time: "4-5 Days" },
  { from: "Delhi", to: "Kolkata", time: "3-4 Days" },
  { from: "Delhi", to: "Hyderabad", time: "3-4 Days" },
  { from: "Delhi", to: "Pune", time: "3-4 Days" }
];

const services = [
  "Interstate household moves",
  "Corporate employee relocation",
  "Vehicle transportation",
  "Pet relocation services",
  "Specialty item transport",
  "Storage-in-transit options",
  "Door-to-door delivery",
  "Express delivery available"
];

const LongDistanceMoving = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Long Distance"
          highlightedText="Moving"
          description="Reliable interstate and cross-country relocations. Your belongings travel safely across India with our GPS-tracked fleet."
          badgeText="Home Relocation Services"
          badgeIcon={Route}
          heroImage={heroImage}
          ctaText="Get Free Quote"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">280+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100+</div>
                <div className="text-secondary-foreground/80 text-sm">Vehicles Fleet</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">99%</div>
                <div className="text-secondary-foreground/80 text-sm">On-Time Delivery</div>
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
                Professional Long Distance Moving Services Across India
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving across states or to a different city is a significant undertaking that requires careful planning and professional expertise. At Panya Global, we specialize in long-distance moving services that make your interstate relocation smooth, secure, and stress-free. With over 15 years of experience and a presence in 280+ cities across India, we have the knowledge and resources to handle even the most complex long-distance moves with ease.
                </p>

                <p>
                  Long-distance moves come with unique challenges that differ from local relocations. Extended travel time, varying weather conditions, multiple handling points, and the need for secure storage during transit all require specialized attention. Our long-distance moving services are designed to address these challenges with comprehensive solutions that ensure your belongings arrive safely at your destination, regardless of the distance.
                </p>

                <p>
                  We understand that when you're moving across the country, you're not just transporting belongings—you're moving your life. That's why we treat every long-distance move with the utmost care and attention to detail. Our team works closely with you from the initial consultation through final delivery to ensure every aspect of your move is handled professionally and efficiently.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Interstate Moving Solutions</h3>
                
                <p>
                  Our long-distance moving services cover every aspect of your relocation, from careful packing to secure transportation and final delivery. We offer door-to-door service that eliminates the need for you to coordinate multiple providers or handle logistics yourself. Our professional packers use high-quality materials and proven techniques to ensure your items are protected throughout the journey.
                </p>

                <p>
                  We provide specialized handling for delicate items, valuable possessions, and specialty furniture that require extra care during long-distance transport. Our vehicles are equipped with modern features including climate control, shock absorption systems, and advanced security measures to protect your belongings during transit. Each item is carefully loaded, secured, and tracked throughout the journey.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Advanced Tracking and Communication</h3>
                
                <p>
                  One of the biggest concerns with long-distance moves is not knowing where your belongings are during transit. We address this with our advanced GPS tracking system that allows you to monitor your shipment in real-time. You'll receive regular updates on your move's progress and can contact our team at any time for information or assistance.
                </p>

                <p>
                  Our customer service team is available throughout your move to answer questions, provide updates, and address any concerns. We believe that clear communication is essential for a successful long-distance relocation, and we make sure you're informed and involved at every step of the process.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Flexible Services for Every Need</h3>
                
                <p>
                  We offer a range of long-distance moving services to accommodate different needs and preferences. Whether you're moving a small apartment or a large family home, relocating for a job transfer, or making a lifestyle change, we have the right solution for you. Our services include standard interstate moves, express delivery options, storage-in-transit services, and specialized handling for unique items.
                </p>

                <p>
                  For customers who prefer to pack their own items, we provide packing supplies and guidance to ensure everything is packed correctly for long-distance transport. We also offer unpacking and setup services at your destination to help you settle in quickly and comfortably.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Insurance and Peace of Mind</h3>
                
                <p>
                  We understand that your belongings represent years of memories and investments. That's why we offer comprehensive transit insurance coverage for all long-distance moves. Our insurance options provide financial protection against damage or loss during transportation, giving you peace of mind throughout your relocation.
                </p>

                <p>
                  Our team is fully trained in proper handling techniques and follows strict protocols to minimize the risk of damage. We use quality packing materials, secure loading methods, and careful unloading procedures to ensure your items arrive in the same condition they left.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Customer-Focused Service</h3>
                
                <p>
                  Customer satisfaction is our top priority. We believe that excellent long-distance moving service is built on reliability, communication, and attention to detail. Our team is committed to delivering on our promises and ensuring your move exceeds expectations.
                </p>

                <p>
                  Don't let the complexity of a long-distance move overwhelm you. Contact Panya Global today to learn more about our comprehensive long-distance moving services and let our experienced team handle your interstate relocation with professionalism and care. We're here to make your move across India as smooth and stress-free as possible.
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
                Why Choose Us for <span className="text-secondary">Long Distance</span> Moves?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Moving across states requires expertise and reliability. We have been doing this for 15+ years.
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
                  Complete <span className="text-secondary">Interstate Moving</span> Solutions
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you are moving for a job, family, or a fresh start, we make long-distance moves hassle-free with our comprehensive services.
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
                    Get Free Quote
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
                  src="https://images.unsplash.com/photo-1586864387789-628af9feed72?w=800&h=600&fit=crop"
                  alt="Long Distance Moving Services"
                  className="rounded-2xl shadow-2xl w-full"
                loading="lazy" decoding="async" />
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <Truck className="w-8 h-8 mb-2" />
                  <div className="font-bold text-2xl">100+</div>
                  <div className="text-sm">GPS-Tracked Vehicles</div>
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

export default LongDistanceMoving;
