import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Hammer, 
  Zap, 
  Droplets,
  CheckCircle2,
  ArrowRight,
  Star,
  Home,
  PaintBucket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import CTA from "@/components/home/CTA";
import ServiceHero from "@/components/services/ServiceHero";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-handyman.webp";

const features = [
  {
    icon: Hammer,
    title: "Skilled Technicians",
    description: "Experienced professionals for all repair work."
  },
  {
    icon: Zap,
    title: "Quick Response",
    description: "Same-day service for urgent repairs."
  },
  {
    icon: Wrench,
    title: "All-in-One",
    description: "Plumbing, electrical, carpentry, and more."
  },
  {
    icon: Home,
    title: "Home Setup",
    description: "Complete home setup after moving."
  }
];

const serviceTypes = [
  { type: "Plumbing", icon: "🔧", description: "Pipe & fixture repairs" },
  { type: "Electrical", icon: "⚡", description: "Wiring & repairs" },
  { type: "Carpentry", icon: "🪚", description: "Furniture assembly" },
  { type: "Painting", icon: "🎨", description: "Wall painting" },
  { type: "AC Service", icon: "❄️", description: "AC installation" },
  { type: "Appliances", icon: "🔌", description: "Appliance setup" }
];

const services = [
  "Furniture assembly",
  "AC installation",
  "Geyser installation",
  "TV wall mounting",
  "Plumbing repairs",
  "Electrical work",
  "Painting services",
  "Door & lock repairs"
];

const HandymanServices = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Handyman"
          highlightedText="Services"
          description="Complete home setup and repair services after your move. From furniture assembly to appliance installation."
          badgeText="Additional Services"
          badgeIcon={Wrench}
          heroImage={heroImage}
          ctaText="Book Service"
        />

        <EasyCoverBanner />

        {/* Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">8000+</div>
                <div className="text-secondary-foreground/80 text-sm">Jobs Completed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">50+</div>
                <div className="text-secondary-foreground/80 text-sm">Skilled Technicians</div>
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
                Professional Handyman Services for Complete Home Setup and Repairs
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving to a new home is an exciting milestone, but the process of setting up and maintaining your living space can be overwhelming. That's where Panya Global's professional handyman services come in. We provide comprehensive home setup and repair solutions to ensure your new space is comfortable, functional, and ready for you to enjoy. From furniture assembly to appliance installation and everything in between, our skilled technicians handle all the technical details so you can focus on making your house a home.
                </p>

                <p>
                  Our team of experienced handymen are trained professionals with expertise in multiple trades, including plumbing, electrical work, carpentry, painting, and appliance installation. This multi-skilled approach means you get a one-stop solution for all your home setup and repair needs, eliminating the hassle of coordinating multiple service providers. Whether you've just moved in and need help assembling furniture, or you're dealing with ongoing maintenance issues, our reliable team is ready to assist.
                </p>

                <p>
                  We understand that every home is unique, and every homeowner has different needs. That's why we offer customized solutions tailored to your specific requirements. Our handymen take the time to understand your needs, assess the scope of work, and provide professional recommendations to ensure the best possible results. We pride ourselves on attention to detail, quality workmanship, and customer satisfaction.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Home Setup Services</h3>
                
                <p>
                  When you move into a new home, there's often a long list of tasks that need to be completed before you can truly settle in. Our home setup services are designed to make this transition as smooth as possible. We handle everything from assembling flat-pack furniture to installing essential appliances and setting up your living space for optimal comfort and functionality.
                </p>

                <p>
                  Furniture assembly is one of our most popular services. Whether you have IKEA furniture, custom pieces, or anything in between, our technicians have the tools and expertise to assemble your furniture correctly and efficiently. We understand that improper assembly can lead to wobbly furniture and potential safety hazards, which is why we take extra care to ensure every piece is assembled according to manufacturer specifications.
                </p>

                <p>
                  Appliance installation is another critical service we provide. From mounting your TV on the wall to installing your air conditioner, geyser, or kitchen appliances, our technicians ensure everything is installed safely and correctly. Proper installation not only ensures optimal performance but also extends the lifespan of your appliances and maintains your warranty coverage.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Expert Plumbing and Electrical Services</h3>
                
                <p>
                  Plumbing and electrical issues can be stressful and potentially dangerous if not handled properly. Our licensed technicians are trained to handle a wide range of plumbing and electrical tasks safely and efficiently. From fixing leaky faucets to installing new light fixtures, we provide professional solutions that you can trust.
                </p>

                <p>
                  Our plumbing services include fixing leaks, unclogging drains, installing new fixtures, repairing water heaters, and addressing any other plumbing issues you may encounter. We use quality materials and proven techniques to ensure lasting repairs that prevent future problems. Our technicians also provide advice on maintaining your plumbing system to avoid costly repairs down the line.
                </p>

                <p>
                  Electrical work requires specialized knowledge and adherence to safety codes. Our electricians handle everything from replacing faulty switches and outlets to installing new lighting fixtures and troubleshooting electrical issues. We ensure all electrical work meets safety standards and local codes, giving you peace of mind about the safety of your home.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Quality Carpentry and Painting Services</h3>
                
                <p>
                  Our carpentry services cover a wide range of woodwork and repair needs. Whether you need shelves installed, doors repaired, or custom woodwork created, our skilled carpenters deliver quality craftsmanship. We work with various types of wood and materials to provide solutions that are both functional and aesthetically pleasing.
                </p>

                <p>
                  Painting services are another area where our handymen excel. Whether you need a single room refreshed or your entire home painted, we provide professional painting services that transform your space. We handle surface preparation, priming, and painting with attention to detail that ensures a smooth, long-lasting finish. Our team also provides advice on paint types and colors to help you achieve the desired look for your home.
                </p>

                <p>
                  We understand that timing is often critical when it comes to home repairs and setup. That's why we offer flexible scheduling and, in many cases, same-day service for urgent repairs. Our technicians arrive on time, respect your property, and work efficiently to complete the job to your satisfaction.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Reliable and Trustworthy Service</h3>
                
                <p>
                  When you invite someone into your home, you want to feel confident that they are trustworthy and professional. All our handymen undergo thorough background checks and are fully insured, providing you with peace of mind. Our technicians are uniformed, punctual, and respectful of your property and time.
                </p>

                <p>
                  We believe in transparent communication and honest pricing. Before any work begins, we provide a clear explanation of what needs to be done and an accurate estimate of the cost. There are no hidden fees or surprises, and we always seek your approval before proceeding with any additional work that may be necessary.
                </p>

                <p>
                  Our commitment to quality doesn't end when the job is complete. We stand behind our work and are always available to address any concerns or questions you may have after the service. Customer satisfaction is our top priority, and we strive to build long-term relationships with our clients based on trust and reliable service.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Emergency and Routine Maintenance</h3>
                
                <p>
                  In addition to setup services, we also provide ongoing maintenance and emergency repair services. Whether it's a burst pipe in the middle of the night or a flickering light that needs attention, our emergency services are available when you need them most. We understand that home issues don't always happen during business hours, which is why we offer flexible scheduling to accommodate your needs.
                </p>

                <p>
                  For routine maintenance, we can help you create a maintenance schedule to keep your home in top condition. Regular maintenance not only prevents major issues but also extends the lifespan of your home's systems and components. Our technicians can identify potential problems early and provide recommendations to prevent costly repairs in the future.
                </p>

                <p>
                  Don't let home setup and maintenance tasks overwhelm you. Contact Panya Global today to learn more about our comprehensive handyman services and let our experienced team help you create the comfortable, functional home you deserve. Whether you need help setting up your new space or ongoing maintenance support, we're here to make your life easier.
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
                Why Choose Our <span className="text-secondary">Handyman</span> Services?
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

        {/* Service Types */}
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
                Services We <span className="text-secondary">Offer</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {serviceTypes.map((service, index) => (
                <motion.div
                  key={service.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {service.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {service.description}
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
                  Our Handyman Services
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
                  Setting Up Your New Home?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Book our handyman services for complete home setup.
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

export default HandymanServices;
