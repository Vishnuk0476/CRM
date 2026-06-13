import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Search, 
  MapPin, 
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-school-search.webp";

const features = [
  {
    icon: Search,
    title: "School Research",
    description: "Comprehensive research on schools matching your requirements."
  },
  {
    icon: MapPin,
    title: "Local Insights",
    description: "Knowledge of school zones and catchment areas."
  },
  {
    icon: FileCheck,
    title: "Enrollment Guidance",
    description: "Guidance on enrollment processes and documentation."
  },
  {
    icon: Users,
    title: "Personal Consultant",
    description: "Dedicated consultant for your school search journey."
  }
];

const schoolTypes = [
  { type: "CBSE Schools", icon: "📚", description: "Central board curriculum" },
  { type: "ICSE Schools", icon: "📖", description: "CISCE board curriculum" },
  { type: "IB Schools", icon: "🌍", description: "International Baccalaureate" },
  { type: "State Board", icon: "🏫", description: "State curriculum schools" },
  { type: "International", icon: "🌐", description: "Foreign curriculum" },
  { type: "Montessori", icon: "🧒", description: "Early childhood education" }
];

const services = [
  "School shortlisting based on preferences",
  "School visits and tours",
  "Admission process guidance",
  "Documentation assistance",
  "Interview preparation tips",
  "Transport & commute analysis",
  "Fee structure comparison",
  "Extra-curricular facilities review"
];

const formFields = [
  { id: "name", label: "Parent/Guardian Name", type: "text" as const, placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email Address", type: "email" as const, placeholder: "your@email.com", required: true },
  { id: "phone", label: "Phone Number", type: "tel" as const, placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "currentCity", label: "Current City", type: "text" as const, placeholder: "Where are you moving from?", required: true },
  { id: "relocatingCity", label: "Relocating To", type: "text" as const, placeholder: "City you're moving to", required: true },
  { 
    id: "childAge", 
    label: "Child's Age/Grade", 
    type: "select" as const, 
    placeholder: "Select age/grade",
    options: [
      { value: "nursery", label: "Nursery (2-3 years)" },
      { value: "kg", label: "Kindergarten (4-5 years)" },
      { value: "primary-1-3", label: "Primary (Class 1-3)" },
      { value: "primary-4-5", label: "Primary (Class 4-5)" },
      { value: "middle-6-8", label: "Middle School (Class 6-8)" },
      { value: "high-9-10", label: "High School (Class 9-10)" },
      { value: "senior-11-12", label: "Senior Secondary (Class 11-12)" },
    ],
    required: true 
  },
  { 
    id: "curriculum", 
    label: "Preferred Curriculum", 
    type: "select" as const, 
    placeholder: "Select curriculum",
    options: [
      { value: "cbse", label: "CBSE" },
      { value: "icse", label: "ICSE" },
      { value: "ib", label: "International Baccalaureate (IB)" },
      { value: "igcse", label: "IGCSE/Cambridge" },
      { value: "state", label: "State Board" },
      { value: "any", label: "No Preference" },
    ],
    required: true 
  },
  { 
    id: "schoolType", 
    label: "School Type Preference", 
    type: "select" as const, 
    placeholder: "Select school type",
    options: [
      { value: "day", label: "Day School" },
      { value: "boarding", label: "Boarding School" },
      { value: "co-ed", label: "Co-Educational" },
      { value: "boys", label: "Boys Only" },
      { value: "girls", label: "Girls Only" },
      { value: "any", label: "No Preference" },
    ],
    required: false 
  },
  { 
    id: "budget", 
    label: "Annual Fee Budget", 
    type: "select" as const, 
    placeholder: "Select budget range",
    options: [
      { value: "below-50k", label: "Below ₹50,000" },
      { value: "50k-1l", label: "₹50,000 - ₹1,00,000" },
      { value: "1l-2l", label: "₹1,00,000 - ₹2,00,000" },
      { value: "2l-5l", label: "₹2,00,000 - ₹5,00,000" },
      { value: "above-5l", label: "Above ₹5,00,000" },
    ],
    required: false 
  },
  { id: "relocateDate", label: "Expected Relocation Date", type: "date" as const, required: true },
  { id: "specialRequirements", label: "Special Requirements", type: "textarea" as const, placeholder: "Any specific requirements like special needs support, sports facilities, etc.", required: false },
];

const formAdditionalInfo = [
  "Shortlist of matching schools",
  "School visit coordination",
  "Admission guidance",
  "Documentation support",
  "Fee structure comparison",
  "Transport analysis",
];

const SchoolSearch = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="School"
          highlightedText="Search"
          description="Find the perfect school for your children in your new city. Expert guidance on admissions and enrollment."
          badgeText="Mobility Services"
          badgeIcon={GraduationCap}
          heroImage={heroImage}
          ctaText="Get Started"
          phoneNumber="+91 11 4155 6447"
        />

        <EasyCoverBanner />

        {/* Stats
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">500+</div>
                <div className="text-secondary-foreground/80 text-sm">Families Helped</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">280+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">98%</div>
                <div className="text-secondary-foreground/80 text-sm">Success Rate</div>
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
                How We <span className="text-secondary">Help You</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Finding the right school in a new city can be overwhelming. We make it easy.
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

        {/* School Types */}
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
                Schools We <span className="text-secondary">Find</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {schoolTypes.map((school, index) => (
                <motion.div
                  key={school.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{school.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {school.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {school.description}
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
                  Complete School Search Services
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
                  Relocating with Kids?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Let us help you find the perfect school in your new city.
                </p>
                <Link to="/quote">
                  <Button size="lg" variant="hero" className="gap-2">
                    Get Started
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
                  Start Your School <span className="text-secondary">Search</span>
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and our education consultants will help you find the perfect school.
                </p>
              </motion.div>

              <ServiceInquiryForm
                serviceName="School Search"
                serviceType="school search"
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

export default SchoolSearch;
