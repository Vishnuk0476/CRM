import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Search, 
  MapPin, 
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Building,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-house-search.webp";

const features = [
  {
    icon: Search,
    title: "Property Research",
    description: "Thorough research based on your preferences and budget."
  },
  {
    icon: MapPin,
    title: "Area Expertise",
    description: "In-depth knowledge of neighborhoods and localities."
  },
  {
    icon: FileCheck,
    title: "Documentation Help",
    description: "Assistance with rental agreements and paperwork."
  },
  {
    icon: Key,
    title: "Move-in Support",
    description: "Seamless transition to your new home."
  }
];

const propertyTypes = [
  { type: "Apartments", icon: "🏢", description: "1BHK to 4BHK flats" },
  { type: "Independent", icon: "🏠", description: "Houses & villas" },
  { type: "Gated Community", icon: "🏘️", description: "Society living" },
  { type: "Service Apts", icon: "🏨", description: "Furnished options" },
  { type: "PG/Hostels", icon: "🛏️", description: "Paying guest" },
  { type: "Corporate", icon: "💼", description: "Company leasing" }
];

const services = [
  "Property shortlisting based on requirements",
  "Accompanied property visits",
  "Neighborhood analysis",
  "Rental negotiation support",
  "Lease agreement review",
  "Utility connection assistance",
  "Move-in coordination",
  "Ongoing support post move"
];

const formFields = [
  { id: "name", label: "Full Name", type: "text" as const, placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email Address", type: "email" as const, placeholder: "your@email.com", required: true },
  { id: "phone", label: "Phone Number", type: "tel" as const, placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "currentCity", label: "Current City", type: "text" as const, placeholder: "Where are you moving from?", required: true },
  { id: "relocatingCity", label: "Relocating To", type: "text" as const, placeholder: "City you're moving to", required: true },
  { 
    id: "propertyType", 
    label: "Property Type", 
    type: "select" as const, 
    placeholder: "Select property type",
    options: [
      { value: "1bhk", label: "1 BHK Apartment" },
      { value: "2bhk", label: "2 BHK Apartment" },
      { value: "3bhk", label: "3 BHK Apartment" },
      { value: "4bhk", label: "4+ BHK Apartment" },
      { value: "villa", label: "Independent House/Villa" },
      { value: "penthouse", label: "Penthouse" },
      { value: "pg", label: "PG/Hostel" },
      { value: "service", label: "Service Apartment" },
    ],
    required: true 
  },
  { 
    id: "furnishing", 
    label: "Furnishing Preference", 
    type: "select" as const, 
    placeholder: "Select furnishing type",
    options: [
      { value: "unfurnished", label: "Unfurnished" },
      { value: "semi-furnished", label: "Semi-Furnished" },
      { value: "fully-furnished", label: "Fully Furnished" },
      { value: "any", label: "No Preference" },
    ],
    required: false 
  },
  { 
    id: "budget", 
    label: "Monthly Budget", 
    type: "select" as const, 
    placeholder: "Select budget range",
    options: [
      { value: "below-15k", label: "Below ₹15,000" },
      { value: "15k-30k", label: "₹15,000 - ₹30,000" },
      { value: "30k-50k", label: "₹30,000 - ₹50,000" },
      { value: "50k-1l", label: "₹50,000 - ₹1,00,000" },
      { value: "1l-2l", label: "₹1,00,000 - ₹2,00,000" },
      { value: "above-2l", label: "Above ₹2,00,000" },
    ],
    required: true 
  },
  { 
    id: "preferredLocality", 
    label: "Preferred Locality/Area", 
    type: "text" as const, 
    placeholder: "e.g., Gurgaon Sector 56, Whitefield",
    required: false 
  },
  { id: "moveDate", label: "Expected Move-in Date", type: "date" as const, required: true },
  { 
    id: "familySize", 
    label: "Family Size", 
    type: "select" as const, 
    placeholder: "Select family size",
    options: [
      { value: "single", label: "Single/Bachelor" },
      { value: "couple", label: "Couple" },
      { value: "small-family", label: "Small Family (3-4)" },
      { value: "large-family", label: "Large Family (5+)" },
    ],
    required: false 
  },
  { id: "additionalRequirements", label: "Additional Requirements", type: "textarea" as const, placeholder: "Pet-friendly, parking, gym, pool, proximity to metro/office, etc.", required: false },
];

const formAdditionalInfo = [
  "Curated property options",
  "Accompanied site visits",
  "Neighborhood insights",
  "Rental negotiation",
  "Lease documentation",
  "Move-in coordination",
];

const HouseSearch = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="House"
          highlightedText="Search"
          description="Find your perfect home in a new city. Expert property search and rental assistance services."
          badgeText="Mobility Services"
          badgeIcon={Home}
          heroImage={heroImage}
          ctaText="Get Started"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">1000+</div>
                <div className="text-secondary-foreground/80 text-sm">Homes Found</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">280+</div>
                <div className="text-secondary-foreground/80 text-sm">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">7 Days</div>
                <div className="text-secondary-foreground/80 text-sm">Average Time</div>
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
                Professional House Search Services for Your Perfect Home
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving to a new city is an exciting journey, but finding the right home can be overwhelming and stressful. That's where Panya Global's professional house search services come in. We take the hassle out of property hunting by providing expert guidance and comprehensive support throughout your home search process. Whether you're looking for a rental apartment, a house to buy, or temporary accommodation, our experienced team is dedicated to finding you the perfect home that meets all your requirements and preferences.
                </p>

                <p>
                  The process of finding a new home in an unfamiliar city involves much more than just looking at property listings. It requires understanding local neighborhoods, knowing the right areas for your lifestyle and budget, and having access to reliable property information. Our house search service combines local expertise with extensive market knowledge to provide you with curated property options that match your specific needs, saving you time and reducing the stress associated with relocation.
                </p>

                <p>
                  We understand that everyone's housing needs are different. Whether you're a young professional looking for a modern apartment close to work, a family seeking a spacious home in a good school district, or someone looking for peaceful retirement living, we tailor our search to your unique requirements. Our goal is to make your transition to a new city as smooth and comfortable as possible by finding you a home where you can truly thrive.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Property Search and Selection</h3>
                
                <p>
                  Our house search process begins with a detailed consultation to understand your specific requirements, preferences, and budget constraints. We take the time to learn about your lifestyle, work location, family needs, and any other factors that are important in your home search. This comprehensive understanding allows us to create a personalized search strategy that focuses on properties that are truly suitable for you.
                </p>

                <p>
                  We utilize multiple property listing platforms, real estate networks, and local contacts to access the most comprehensive and up-to-date property information. Our team continuously monitors the market for new listings that match your criteria, ensuring you have access to the best available options. We don't just rely on online listings; we also tap into off-market opportunities and upcoming properties that may not yet be publicly advertised.
                </p>

                <p>
                  Once we identify potential properties, we conduct preliminary screenings to ensure they meet your basic requirements. This includes verifying property details, checking for any red flags, and assessing whether the property genuinely matches your needs. We then present you with a curated shortlist of the most suitable options, complete with detailed information and professional insights about each property.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Expert Neighborhood Analysis and Location Guidance</h3>
                
                <p>
                  Choosing the right neighborhood is just as important as finding the right property. Our house search service includes comprehensive neighborhood analysis to help you understand the character, amenities, and lifestyle of different areas in your new city. We provide insights into factors such as safety, schools, transportation, shopping, dining, and recreational facilities.
                </p>

                <p>
                  We understand that different people have different priorities when it comes to location. Some may prioritize proximity to work, while others may value access to good schools or recreational facilities. Some may prefer a quiet residential area, while others may enjoy the energy of a bustling urban center. Our team helps you identify the neighborhoods that best align with your lifestyle and preferences.
                </p>

                <p>
                  We also provide information about future development plans in different areas, which can be crucial for both rental and purchase decisions. Understanding the growth trajectory of a neighborhood can help you make informed decisions about where to live and potentially identify areas that may appreciate in value over time.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Accompanied Property Visits and Professional Assessment</h3>
                
                <p>
                  We don't just send you property listings and wish you luck. Our service includes accompanied property visits, where our experienced professionals guide you through the viewing process and provide expert insights about each property. Having a knowledgeable professional with you during viewings can help you identify important details that you might otherwise miss.
                </p>

                <p>
                  During property visits, we assess various aspects of the property, including its condition, layout, natural light, storage space, and potential issues. We also evaluate the building's maintenance, security features, and overall management. Our team asks the right questions to property owners or agents and helps you understand the true condition and value of each property.
                </p>

                <p>
                  We provide honest, objective feedback about each property, highlighting both its strengths and potential drawbacks. This professional assessment helps you make informed decisions and avoid properties that might seem appealing initially but have underlying issues or don't truly meet your needs.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Negotiation Support and Documentation Assistance</h3>
                
                <p>
                  Once you've found a property you like, our support continues through the negotiation and documentation process. We assist with rental negotiations, helping you secure the best possible terms and conditions. Our experience with the local real estate market gives us valuable insights into fair pricing and negotiation strategies.
                </p>

                <p>
                  For rental properties, we help review and understand lease agreements, ensuring you're aware of all terms and conditions before signing. We can also assist with the documentation process, including gathering required paperwork, coordinating with property owners or management companies, and ensuring all formalities are completed correctly.
                </p>

                <p>
                  For those looking to purchase property, we can provide guidance on the buying process, connect you with reliable real estate professionals, and help you understand the legal and financial aspects of property acquisition in your new city.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Post-Move Support and Ongoing Assistance</h3>
                
                <p>
                  Our commitment to your satisfaction doesn't end once you've moved into your new home. We provide post-move support to help you settle in and address any issues that may arise after your move-in. Whether you need recommendations for local services, assistance with utility connections, or guidance on community resources, we're here to help.
                </p>

                <p>
                  We understand that adjusting to a new city takes time, and having a reliable point of contact can make a significant difference in your transition experience. Our team remains available to answer questions, provide local insights, and offer support as you establish your new life in your new home.
                </p>

                <p>
                  Don't let the stress of house hunting overshadow the excitement of your move to a new city. Contact Panya Global today to learn more about our comprehensive house search services and let our experienced team help you find the perfect home where you can build your future with confidence and peace of mind.
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
                How We <span className="text-secondary">Help You</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Finding the right home in a new city is stressful. We handle it for you.
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

        {/* Property Types */}
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
                Properties We <span className="text-secondary">Find</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {propertyTypes.map((property, index) => (
                <motion.div
                  key={property.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{property.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {property.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {property.description}
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
                  Complete House Search Services
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
                  Looking for a Home?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Let us find the perfect home for you in your new city.
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
                  Start Your House <span className="text-secondary">Search</span>
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below and our property consultants will find your perfect home.
                </p>
              </motion.div>

              <ServiceInquiryForm
                serviceName="House Search"
                serviceType="house search"
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

export default HouseSearch;
