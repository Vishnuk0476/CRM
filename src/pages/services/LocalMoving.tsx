import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Shield, 
  Users,
  CheckCircle2,
  ArrowRight,
  Truck,
  Package,
  Home,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-local-moving.webp";

const features = [
  {
    icon: Clock,
    title: "Same Day Service",
    description: "Need to move quickly? Our same-day service ensures you're settled in your new home without delay."
  },
  {
    icon: Shield,
    title: "Easy Cover",
    description: "Coverage options for all your belongings during the entire moving process."
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Our trained professionals handle your possessions with care and expertise."
  },
  {
    icon: MapPin,
    title: "City-Wide Coverage",
    description: "We cover all areas within your city including suburbs and surrounding regions."
  }
];

const services = [
  "Apartment & flat moves",
  "House relocations",
  "Villa & bungalow moves",
  "Single item transport",
  "Furniture moving",
  "Appliance relocation",
  "Piano moving",
  "Senior citizen moves"
];

const process = [
  { step: 1, title: "Free Survey", description: "We visit your home to assess your moving needs" },
  { step: 2, title: "Custom Quote", description: "Receive a detailed quote with no hidden charges" },
  { step: 3, title: "Professional Packing", description: "Our team carefully packs all your belongings" },
  { step: 4, title: "Safe Transport", description: "GPS-tracked vehicles ensure safe delivery" },
  { step: 5, title: "Unpacking & Setup", description: "We unpack and arrange items at your new home" }
];

const LocalMoving = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Local Moving"
          highlightedText="Services"
          description="Seamless local relocations within your city. Professional, reliable, and stress-free moving services tailored to your needs."
          badgeText="Home Relocation Services"
          badgeIcon={Home}
          heroImage={heroImage}
          ctaText="Get Free Quote"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">9.5K+</div>
                <div className="text-secondary-foreground/80 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">280+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">15+</div>
                <div className="text-secondary-foreground/80 text-sm">Years Experience</div>
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
                Professional Local Moving Services for Stress-Free Relocations
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving within your city should be simple and stress-free. At Panya Global, we specialize in local moving services that make your relocation experience seamless and efficient. Whether you're moving across town, to a nearby suburb, or within the same neighborhood, our professional team ensures your belongings are handled with the utmost care and delivered safely to your new destination.
                </p>

                <p>
                  Local moves come with their own unique challenges and requirements. Unlike long-distance relocations, local moves often require quick turnaround times and efficient coordination. Our local moving experts understand the specific needs of city relocations and work diligently to minimize disruption to your daily life. We pride ourselves on punctuality, professionalism, and attention to detail that ensures your move goes smoothly from start to finish.
                </p>

                <p>
                  We offer comprehensive local moving services that cover every aspect of your relocation. From careful packing and secure loading to safe transportation and efficient unloading, our team handles each step with precision and care. Our vehicles are equipped with modern features including GPS tracking, climate control, and advanced safety systems to ensure your belongings arrive in perfect condition.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Personalized Service for Every Move</h3>
                
                <p>
                  We understand that no two moves are exactly alike. That's why we begin each local moving project with a detailed consultation to understand your specific needs, timeline, and preferences. Our moving consultants visit your current location to assess the scope of your move, identify any special requirements, and create a customized moving plan tailored to your situation.
                </p>

                <p>
                  Whether you're moving a small studio apartment or a large family home, we provide the right resources and expertise to handle your relocation efficiently. Our team is trained to handle delicate items, valuable possessions, and specialty furniture with the care they deserve. We use high-quality packing materials and proven techniques to ensure everything is protected during transit.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Efficient and Reliable Service</h3>
                
                <p>
                  Time is valuable, especially when you're relocating. Our local moving services are designed for efficiency without compromising on quality. We understand that your schedule is important, which is why we offer flexible timing options including same-day service for urgent moves. Our team arrives on time, works efficiently, and completes your move within the agreed timeframe.
                </p>

                <p>
                  Our local moving vehicles are strategically positioned throughout the city, allowing us to respond quickly to your moving needs. This local presence also means we have in-depth knowledge of traffic patterns, parking regulations, and building access requirements in different neighborhoods, which helps us plan the most efficient routes and avoid potential delays.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Moving Solutions</h3>
                
                <p>
                  Our local moving services go beyond just transporting your belongings. We offer complete moving solutions that include professional packing services, furniture disassembly and reassembly, appliance handling, and even unpacking and setup at your new location. This comprehensive approach means you can focus on settling into your new home while we handle all the moving details.
                </p>

                <p>
                  For customers who prefer to pack their own items, we also provide packing supplies and guidance to ensure everything is packed correctly and securely. Our team is always available to answer questions, provide moving tips, and offer support throughout the entire process.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Customer Satisfaction Guaranteed</h3>
                
                <p>
                  Customer satisfaction is our top priority. We believe that excellent service is built on clear communication, reliability, and attention to detail. Our team keeps you informed throughout the moving process and addresses any concerns promptly. We stand behind our work with a satisfaction guarantee and are committed to resolving any issues that may arise.
                </p>

                <p>
                  Don't let the stress of moving overshadow this exciting new chapter in your life. Contact Panya Global today to schedule your local move and experience the difference that professional, personalized service can make. Our dedicated team is ready to help you transition smoothly to your new home with minimal stress and maximum efficiency.
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
                Why Choose Our <span className="text-secondary">Local Moving</span> Service?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We understand that every move is unique. Our local moving experts ensure a personalized experience for every customer.
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
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Comprehensive <span className="text-secondary">Local Moving</span> Solutions
                </h2>
                <p className="text-muted-foreground mb-8">
                  From small apartments to large family homes, we handle all types of local moves with precision and care. Our services include:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <li key={service} className="flex items-center gap-3 text-foreground">
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
                className="relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop"
                  alt="Local Moving Services"
                  className="rounded-2xl shadow-2xl w-full"
                loading="lazy" decoding="async" />
                <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-lg">
                  <Truck className="w-8 h-8 mb-2" />
                  <div className="font-bold text-2xl">500+</div>
                  <div className="text-sm">Moves Monthly</div>
                </div>
              </motion.div>
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
                Our <span className="text-secondary">Moving Process</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A simple 5-step process that ensures your move is smooth and hassle-free.
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

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready for a Stress-Free Local Move?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Get a free, no-obligation quote today and experience the difference of professional moving services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Get Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="tel:+918800446447">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Call Now
                  </Button>
                </a>
              </div>
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

export default LocalMoving;
