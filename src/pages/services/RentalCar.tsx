import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Car, 
  Clock, 
  Shield, 
  MapPin,
  CheckCircle2,
  ArrowRight,
  Star,
  Key,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-rental-car.webp";

const features = [
  {
    icon: Car,
    title: "Wide Fleet Range",
    description: "From hatchbacks to SUVs, we have vehicles for every need."
  },
  {
    icon: Clock,
    title: "Flexible Rentals",
    description: "Daily, weekly, or monthly rental options available."
  },
  {
    icon: Shield,
    title: "Easy Cover",
    description: "Comprehensive insurance coverage included."
  },
  {
    icon: Navigation,
    title: "GPS Equipped",
    description: "All vehicles come with GPS navigation."
  }
];

const vehicleTypes = [
  { type: "Hatchbacks", icon: "🚗", description: "Swift, i20, Polo" },
  { type: "Sedans", icon: "🚙", description: "City, Verna, Ciaz" },
  { type: "SUVs", icon: "🚐", description: "Creta, Seltos, XUV" },
  { type: "Premium", icon: "🏎️", description: "Fortuner, Endeavour" },
  { type: "Tempo Traveller", icon: "🚌", description: "12-16 seater" },
  { type: "Mini Bus", icon: "🚍", description: "20+ seater" }
];

const services = [
  "Airport pickup & drop",
  "City exploration",
  "Long distance travel",
  "Corporate rentals",
  "Driver on request",
  "24/7 roadside assistance",
  "Self-drive options",
  "Chauffeur-driven vehicles"
];

const formFields = [
  { id: "name", label: "Full Name", type: "text" as const, placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email Address", type: "email" as const, placeholder: "your@email.com", required: true },
  { id: "phone", label: "Phone Number", type: "tel" as const, placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "pickupCity", label: "Pickup City", type: "text" as const, placeholder: "City for vehicle pickup", required: true },
  { 
    id: "vehicleType", 
    label: "Vehicle Type", 
    type: "select" as const, 
    placeholder: "Select vehicle type",
    options: [
      { value: "hatchback", label: "Hatchback (Swift, i20, Polo)" },
      { value: "sedan", label: "Sedan (City, Verna, Ciaz)" },
      { value: "suv", label: "SUV (Creta, Seltos, XUV)" },
      { value: "premium-suv", label: "Premium SUV (Fortuner, Endeavour)" },
      { value: "tempo", label: "Tempo Traveller (12-16 seater)" },
      { value: "mini-bus", label: "Mini Bus (20+ seater)" },
    ],
    required: true 
  },
  { 
    id: "rentalType", 
    label: "Rental Type", 
    type: "select" as const, 
    placeholder: "Select rental duration",
    options: [
      { value: "hourly", label: "Hourly Rental" },
      { value: "daily", label: "Daily Rental" },
      { value: "weekly", label: "Weekly Rental" },
      { value: "monthly", label: "Monthly Rental" },
      { value: "long-term", label: "Long Term (3+ months)" },
    ],
    required: true 
  },
  { 
    id: "driverOption", 
    label: "Driver Preference", 
    type: "select" as const, 
    placeholder: "Select driver option",
    options: [
      { value: "self-drive", label: "Self Drive" },
      { value: "with-driver", label: "With Chauffeur" },
    ],
    required: true 
  },
  { id: "pickupDate", label: "Pickup Date", type: "date" as const, required: true },
  { id: "dropoffDate", label: "Drop-off Date", type: "date" as const, required: false },
  { 
    id: "purpose", 
    label: "Purpose of Rental", 
    type: "select" as const, 
    placeholder: "Select purpose",
    options: [
      { value: "airport", label: "Airport Transfer" },
      { value: "city", label: "City Exploration" },
      { value: "outstation", label: "Outstation Travel" },
      { value: "corporate", label: "Corporate Use" },
      { value: "wedding", label: "Wedding/Events" },
      { value: "other", label: "Other" },
    ],
    required: false 
  },
  { id: "additionalRequests", label: "Additional Requests", type: "textarea" as const, placeholder: "Any specific requirements like child seat, GPS, etc.", required: false },
];

const formAdditionalInfo = [
  "GPS navigation included",
  "Full insurance coverage",
  "24/7 roadside assistance",
  "Flexible pickup/drop",
  "Clean sanitized vehicles",
  "Transparent pricing",
];

const RentalCar = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Car"
          highlightedText="Rental"
          description="Explore your new city with our reliable car rental services. Self-drive or chauffeur-driven options available."
          badgeText="Mobility Services"
          badgeIcon={Car}
          heroImage={heroImage}
          ctaText="Book Now"
        />

        <EasyCoverBanner />

        {/* Stats
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">100+</div>
                <div className="text-secondary-foreground/80 text-sm">Vehicles</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">50+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">24/7</div>
                <div className="text-secondary-foreground/80 text-sm">Support</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">4.9</div>
                <div className="text-secondary-foreground/80 text-sm flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Rating
                </div>
              </div>
            </div>
          </div>
        </section> */}

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
                Why Choose Our <span className="text-secondary">Car Rental</span>?
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
                Our <span className="text-secondary">Fleet</span>
              </h2>
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
                  Rental Services Include
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
                  Need a Car?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Book your rental car today and explore your new city comfortably.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Book Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Book Your <span className="text-secondary">Rental Car</span>
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll arrange the perfect vehicle for your needs.
                </p>
              </motion.div>

              <ServiceInquiryForm
                serviceName="Car Rental"
                serviceType="car rental"
                fields={formFields}
                additionalInfo={formAdditionalInfo}
              />
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

export default RentalCar;
