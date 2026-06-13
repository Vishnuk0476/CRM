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
  Award,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import CostCalculator from "@/components/services/ExitCleanCalculator";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-exit-clean.webp";

const features = [
  {
    icon: Award,
    title: "Bond Back Guarantee",
    description: "Get your full security deposit back with our thorough cleaning."
  },
  {
    icon: Shield,
    title: "Insurance Covered",
    description: "Fully insured service for your peace of mind."
  },
  {
    icon: Clock,
    title: "Same Day Service",
    description: "Urgent move-out? We offer same-day cleaning solutions."
  },
  {
    icon: ThumbsUp,
    title: "Landlord Approved",
    description: "Cleaning that meets landlord and property manager standards."
  }
];

const cleaningAreas = [
  { area: "Kitchen", icon: "🍳", description: "Deep clean & degrease" },
  { area: "Bathrooms", icon: "🚿", description: "Sanitize & descale" },
  { area: "Bedrooms", icon: "🛏️", description: "Dust & vacuum" },
  { area: "Living Areas", icon: "🛋️", description: "Floor to ceiling" },
  { area: "Balcony", icon: "🌿", description: "Sweep & wash" },
  { area: "Windows", icon: "🪟", description: "Inside & outside" }
];

const services = [
  "Complete kitchen degreasing",
  "Oven & stovetop cleaning",
  "Bathroom deep sanitization",
  "Tile & grout cleaning",
  "Carpet steam cleaning",
  "Window & track cleaning",
  "Wall spot & mark removal",
  "Light fixture cleaning"
];

const packages = [
  { 
    name: "Standard Exit Clean", 
    description: "Ideal for apartments", 
    features: ["General cleaning", "Kitchen & bathroom", "Vacuuming", "Mopping"] 
  },
  { 
    name: "Premium Exit Clean", 
    description: "For maximum deposit recovery", 
    features: ["Deep cleaning", "Carpet cleaning", "Window cleaning", "Oven cleaning", "Wall cleaning"] 
  },
  { 
    name: "Complete Exit Clean", 
    description: "Full property transformation", 
    features: ["Everything in Premium", "Balcony cleaning", "Garage cleaning", "Garden maintenance", "Touch-up painting"] 
  }
];

const ExitCleanService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Exit Clean"
          highlightedText="Service"
          description="Professional end-of-lease cleaning to ensure you get your full security deposit back. Bond back guaranteed."
          badgeText="Additional Services"
          badgeIcon={Sparkles}
          heroImage={heroImage}
          ctaText="Book Exit Clean"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">5000+</div>
                <div className="text-secondary-foreground/80 text-sm">Properties Cleaned</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100%</div>
                <div className="text-secondary-foreground/80 text-sm">Bond Back Rate</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Same Day</div>
                <div className="text-secondary-foreground/80 text-sm">Service Available</div>
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
                Professional Exit Cleaning Services for Maximum Bond Recovery
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving out of a rental property can be stressful enough without worrying about getting your security deposit back. That's where Panya Global's professional exit cleaning services come in. We specialize in end-of-lease cleaning that meets the highest standards set by landlords and property managers, ensuring you get your full bond back. Our experienced team understands the specific requirements for rental property cleaning and uses professional-grade equipment and techniques to deliver exceptional results every time.
                </p>

                <p>
                  Security deposits can represent a significant amount of money, and many tenants lose portions of their deposit due to inadequate cleaning. Common issues include overlooked areas, insufficient cleaning depth, and failure to meet the property's original condition standards. Our exit cleaning service addresses all these concerns with a comprehensive approach that covers every corner of your property, from the kitchen appliances to the window tracks and everything in between.
                </p>

                <p>
                  We take pride in our attention to detail and commitment to quality. Our cleaning professionals are trained to identify and address the specific cleaning challenges that rental properties face, including built-up grime, stains, and wear from daily living. We use environmentally friendly yet powerful cleaning products that effectively remove dirt and grime without damaging surfaces or leaving harmful residues.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Our Comprehensive Exit Cleaning Process</h3>
                
                <p>
                  Our exit cleaning process is designed to be thorough and systematic, ensuring no area is overlooked. We begin with a detailed assessment of your property to identify specific cleaning needs and any areas that may require special attention. This assessment helps us create a customized cleaning plan tailored to your property's unique requirements.
                </p>

                <p>
                  We start with the most challenging areas first, such as kitchens and bathrooms, where grease, soap scum, and hard water stains can accumulate over time. Our team uses professional-grade cleaning solutions and equipment to tackle these tough stains and restore surfaces to their original condition. We pay special attention to areas that landlords typically inspect closely, including behind appliances, inside cabinets, and around fixtures.
                </p>

                <p>
                  Our cleaning process includes detailed work in every room, from dusting ceiling fans and light fixtures to cleaning baseboards and door frames. We also address often-overlooked areas like window tracks, air vents, and behind furniture. Every surface is cleaned, sanitized, and polished to ensure your property meets or exceeds the condition it was in when you moved in.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Bond Back Guarantee and Quality Assurance</h3>
                
                <p>
                  We stand behind our work with a bond back guarantee, demonstrating our confidence in the quality of our cleaning services. If your landlord or property manager identifies any areas that need additional attention after our cleaning, we'll return to address them at no extra cost. This guarantee provides you with peace of mind and protects your financial investment in your security deposit.
                </p>

                <p>
                  Our team is fully insured and bonded, providing additional protection for both your property and our workers. We carry comprehensive liability insurance that covers any accidental damage that might occur during the cleaning process. This insurance coverage demonstrates our professionalism and commitment to protecting our clients' interests.
                </p>

                <p>
                  We understand that timing is often critical when moving out of a rental property. That's why we offer flexible scheduling, including same-day service for urgent situations. Our team works efficiently without compromising quality, ensuring your property is cleaned to the highest standards within your timeframe.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Customized Cleaning Packages for Every Need</h3>
                
                <p>
                  We offer multiple cleaning packages to suit different needs and budgets. Our standard exit clean package provides comprehensive cleaning for typical rental properties, while our premium package includes additional services such as carpet steam cleaning, window cleaning, and detailed work in high-traffic areas. For properties that require extensive cleaning or have been occupied for extended periods, our complete exit clean package offers the most thorough service available.
                </p>

                <p>
                  Each package is designed to address the specific requirements of end-of-lease cleaning while providing excellent value for our clients. We use a transparent pricing structure with no hidden fees or surprises. When you receive a quote from us, you know exactly what you're getting and what it will cost.
                </p>

                <p>
                  Our pricing is competitive while maintaining the highest quality standards. We believe that professional exit cleaning should be accessible to all tenants, and we work hard to provide exceptional value without compromising on quality or thoroughness.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Customer Satisfaction and Professional Service</h3>
                
                <p>
                  Customer satisfaction is our top priority. From your initial inquiry to the completion of the cleaning service, we strive to provide exceptional customer service and clear communication. Our team arrives on time, respects your property, and works efficiently to complete the job to your satisfaction.
                </p>

                <p>
                  We understand that moving is a stressful time, and we aim to make the cleaning portion as easy and worry-free as possible. Our professional cleaners are courteous, respectful, and focused on delivering the best possible results. They are trained to work around your schedule and accommodate your specific needs and preferences.
                </p>

                <p>
                  Don't risk losing your security deposit to inadequate cleaning. Contact Panya Global today to schedule your exit cleaning service and ensure you get your full bond back. Our professional team is ready to help you move out with confidence and peace of mind.
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
                Why Choose Our <span className="text-secondary">Exit Clean</span>?
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

        {/* Cleaning Areas */}
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
                Areas We <span className="text-secondary">Clean</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cleaningAreas.map((area, index) => (
                <motion.div
                  key={area.area}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{area.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {area.area}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {area.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
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
                Exit Clean <span className="text-secondary">Packages</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-8 rounded-2xl border ${index === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                >
                  <h3 className={`font-heading text-xl font-bold mb-2 ${index === 1 ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {pkg.name}
                  </h3>
                  <p className={`text-sm mb-6 ${index === 1 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {pkg.description}
                  </p>
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className={`flex items-center gap-2 text-sm ${index === 1 ? 'text-primary-foreground' : 'text-foreground'}`}>
                        <CheckCircle2 className={`w-4 h-4 ${index === 1 ? 'text-secondary' : 'text-secondary'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/quote" className="block mt-6">
                    <Button 
                      size="lg" 
                      variant={index === 1 ? "hero" : "outline"}
                      className="w-full gap-2"
                    >
                      Get Quote
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
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
                  What's Included
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
                  Moving Out Soon?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Book your exit clean today and get your full bond back.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Book Exit Clean
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cost Calculator Section */}
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
                Cost <span className="text-secondary">Calculator</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get an instant estimate for your exit cleaning service.
              </p>
            </motion.div>

            <CostCalculator />
          </div>
        </section>

        <CTA />
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default ExitCleanService;
