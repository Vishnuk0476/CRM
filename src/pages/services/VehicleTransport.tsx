import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Car, 
  Truck, 
  Shield, 
  Clock,
  CheckCircle2,
  ArrowRight,
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
import heroImage from "@/assets/services/hero-vehicle-transport.webp";

const features = [
  {
    icon: Shield,
    title: "Easy Cover",
    description: "Transit protection options for your vehicle during the journey."
  },
  {
    icon: Navigation,
    title: "GPS Tracking",
    description: "Real-time tracking of your vehicle throughout the journey."
  },
  {
    icon: Truck,
    title: "Enclosed Carriers",
    description: "Protected transport in enclosed car carriers for premium vehicles."
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "Guaranteed delivery within the committed timeframe."
  }
];

const vehicleTypes = [
  { type: "Hatchbacks", icon: "🚗", description: "Maruti, Hyundai, Honda & more" },
  { type: "Sedans", icon: "🚙", description: "All sedan models and sizes" },
  { type: "SUVs", icon: "🚐", description: "Compact to full-size SUVs" },
  { type: "Luxury Cars", icon: "🏎️", description: "Premium & exotic vehicles" },
  { type: "Two Wheelers", icon: "🏍️", description: "Bikes, scooters & superbikes" },
  { type: "Commercial", icon: "🚛", description: "Tempos, pickups & trucks" }
];

const services = [
  "Door-to-door car transport",
  "Open & enclosed carriers",
  "Two-wheeler transport",
  "Premium car shipping",
  "Interstate vehicle relocation",
  "International car shipping",
  "Classic car transport",
  "Fleet relocation"
];

const VehicleTransport = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Vehicle"
          highlightedText="Transport"
          description="Safe and reliable car and bike transportation across India. Your vehicle deserves the best care during transit."
          badgeText="Home Relocation Services"
          badgeIcon={Car}
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
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">5000+</div>
                <div className="text-secondary-foreground/80 text-sm">Vehicles Transported</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">280+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">0%</div>
                <div className="text-secondary-foreground/80 text-sm">Damage Rate</div>
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
                Professional Vehicle Transport Services for Safe and Reliable Shipping
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Transporting your vehicle across the country or to a different state requires specialized care and expertise. At Panya Global, we provide professional vehicle transport services that ensure your car, bike, or other vehicle reaches its destination safely and on time. With thousands of vehicles successfully transported and a 0% damage rate, we have earned the trust of customers who value their vehicles and want reliable, professional handling during transit.
                </p>

                <p>
                  Vehicle transport is more than just loading a car onto a carrier and driving to the destination. It requires careful preparation, proper securing techniques, route planning, and constant monitoring to ensure your vehicle arrives in the same condition it left. Our professional vehicle transport team follows industry best practices and uses specialized equipment to handle all types of vehicles, from compact cars to luxury vehicles, motorcycles to commercial vehicles.
                </p>

                <p>
                  We understand that your vehicle represents a significant investment and often holds sentimental value. That's why we treat every vehicle with the utmost care and attention to detail. Our transport specialists are trained in proper vehicle handling techniques and use advanced securing methods to prevent any movement or damage during transit. We also provide comprehensive insurance coverage options to give you peace of mind throughout the journey.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Vehicle Transport Solutions</h3>
                
                <p>
                  We offer a range of vehicle transport services to accommodate different needs and preferences. For standard vehicles, our open carriers provide cost-effective transportation while maintaining safety and security. For luxury vehicles, classic cars, or vehicles with special modifications, our enclosed carriers offer additional protection from weather, road debris, and other environmental factors.
                </p>

                <p>
                  Our door-to-door service eliminates the need for you to transport your vehicle to a terminal or depot. We pick up your vehicle from your specified location and deliver it directly to your destination, making the process convenient and hassle-free. We also offer terminal-to-terminal service for customers who prefer to drop off and pick up their vehicles at our secure facilities.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Advanced Tracking and Communication</h3>
                
                <p>
                  We understand that not knowing where your vehicle is during transit can be stressful. That's why we provide real-time GPS tracking for all our vehicle transport services. You can monitor your vehicle's progress throughout the journey and receive regular updates on its location and estimated time of arrival.
                </p>

                <p>
                  Our customer service team is available throughout the transport process to answer questions, provide updates, and address any concerns. We believe that clear communication is essential for a positive vehicle transport experience, and we make sure you're informed and involved at every step.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Expert Handling for All Vehicle Types</h3>
                
                <p>
                  We handle a wide range of vehicles, including cars, SUVs, trucks, motorcycles, scooters, luxury vehicles, classic cars, and commercial vehicles. Our team is trained to handle each type of vehicle with the appropriate care and techniques. Whether you have a daily commuter, a high-performance sports car, or a vintage classic, we have the expertise to transport it safely.
                </p>

                <p>
                  For motorcycles and two-wheelers, we use specialized equipment and securing methods to ensure stability during transit. For luxury and exotic vehicles, we offer enclosed transport options and white-glove service for added protection and peace of mind.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Insurance and Customer Protection</h3>
                
                <p>
                  We offer comprehensive insurance coverage options for all vehicle transport services. Our insurance policies provide financial protection against damage, theft, or loss during transit, giving you peace of mind throughout your vehicle's journey. We also provide detailed documentation and condition reports before and after transport to ensure transparency and accountability.
                </p>

                <p>
                  Don't trust your valuable vehicle to just any transport service. Contact Panya Global today to learn more about our professional vehicle transport services and let our experienced team handle your vehicle with the care and expertise it deserves. We're committed to providing safe, reliable, and stress-free vehicle transport services that exceed your expectations.
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
                Why Choose Our <span className="text-secondary">Vehicle Transport</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your vehicle is valuable. We treat it with the same care you do.
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

        {/* Vehicle Types */}
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
                We Transport <span className="text-secondary">All Vehicle Types</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From compact cars to luxury vehicles, we handle all types with care.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {vehicleTypes.map((vehicle, index) => (
                <motion.div
                  key={vehicle.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{vehicle.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {vehicle.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {vehicle.description}
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
                  Complete <span className="text-secondary">Vehicle Shipping</span> Solutions
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether it is a daily commuter or a prized possession, we ensure your vehicle reaches safely.
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
                    Get Vehicle Transport Quote
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
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop"
                  alt="Vehicle Transport Services"
                  className="rounded-2xl shadow-2xl w-full"
                loading="lazy" decoding="async" />
                <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-lg">
                  <Car className="w-8 h-8 mb-2" />
                  <div className="font-bold text-2xl">100%</div>
                  <div className="text-sm">Safe Delivery</div>
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

export default VehicleTransport;
