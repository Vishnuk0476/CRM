import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Stethoscope, 
  Plane,
  CheckCircle2,
  ArrowRight,
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
import heroImage from "@/assets/services/hero-pet-relocation.webp";

const features = [
  {
    icon: Heart,
    title: "Pet-Friendly Care",
    description: "Trained handlers who understand and love animals."
  },
  {
    icon: Stethoscope,
    title: "Vet Support",
    description: "Veterinary consultation and health checks included."
  },
  {
    icon: Shield,
    title: "Safe Transport",
    description: "Climate-controlled vehicles and IATA-approved crates."
  },
  {
    icon: Plane,
    title: "Air & Ground",
    description: "Both domestic flights and road transport options."
  }
];

const petTypes = [
  { type: "Dogs", icon: "🐕", description: "All breeds & sizes" },
  { type: "Cats", icon: "🐈", description: "Domestic & exotic" },
  { type: "Birds", icon: "🦜", description: "Parrots, budgies & more" },
  { type: "Fish", icon: "🐠", description: "Aquarium relocation" },
  { type: "Rabbits", icon: "🐰", description: "Small mammals" },
  { type: "Others", icon: "🐾", description: "Exotic pets" }
];

const services = [
  "Door-to-door pet transport",
  "IATA-approved crates provided",
  "Veterinary documentation",
  "Customs & quarantine handling",
  "International pet shipping",
  "Pet boarding during transit",
  "Real-time tracking updates",
  "24/7 care during journey"
];

const process = [
  { step: 1, title: "Consultation", description: "Discuss your pet's needs and travel requirements" },
  { step: 2, title: "Health Check", description: "Veterinary examination and required vaccinations" },
  { step: 3, title: "Documentation", description: "Complete all permits and travel documents" },
  { step: 4, title: "Safe Transport", description: "Climate-controlled journey with regular updates" },
  { step: 5, title: "Happy Reunion", description: "Deliver your pet safely to the destination" }
];

const PetRelocation = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <ServiceHero
          title="Pet"
          highlightedText="Relocation"
          description="Your furry family members deserve the best care during relocation. Safe, stress-free pet transport across India and internationally."
          badgeText="Home Relocation Services"
          badgeIcon={Heart}
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
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">5 Star</div>
                <div className="text-secondary-foreground/80 text-sm">Rating</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Domestic</div>
                <div className="text-secondary-foreground/80 text-sm">& International</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">Safe</div>
                <div className="text-secondary-foreground/80 text-sm">Transport AC Vehicles</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary-foreground">2000+</div>
                <div className="text-secondary-foreground/80 text-sm">Pets Relocated</div>
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
                Professional Pet Relocation Services for Safe and Stress-Free Travel
              </h2>
              
              <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  Moving with pets requires special care, attention, and expertise. At Panya Global, we understand that your pets are beloved family members, and we treat them with the love, care, and respect they deserve during relocation. Our professional pet relocation services ensure that your furry, feathered, or scaled companions travel safely and comfortably, whether you're moving across town or to another country.
                </p>

                <p>
                  Pet relocation involves much more than just transporting an animal from one location to another. It requires understanding the specific needs of different species, proper handling techniques, appropriate documentation, and careful planning to minimize stress and ensure safety. Our trained pet relocation specialists are experienced in handling all types of pets, from dogs and cats to birds, fish, rabbits, and exotic animals, with the knowledge and care they need.
                </p>

                <p>
                  We provide comprehensive pet relocation services that cover every aspect of your pet's journey. From initial consultation and health checks to documentation, transportation, and final delivery, our team manages the entire process with attention to detail and compassion. We work closely with veterinarians to ensure your pet is healthy and fit for travel, and we handle all necessary documentation including health certificates, vaccination records, and import/export permits.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Comprehensive Pet Care and Safety</h3>
                
                <p>
                  Your pet's safety and comfort are our top priorities. We use climate-controlled vehicles equipped with proper ventilation and temperature control to ensure a comfortable journey. For air travel, we use IATA-approved crates that provide adequate space, ventilation, and security. Our pet handlers are trained in animal behavior and first aid, and they monitor your pet's condition throughout the journey.
                </p>

                <p>
                  We understand that travel can be stressful for pets. That's why we take extra care to minimize stress through gentle handling, regular breaks for exercise and bathroom needs, and providing familiar items like blankets or toys when possible. We also offer pet boarding services for pets that need to stay with us temporarily during the relocation process.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Expert Handling for All Pet Types</h3>
                
                <p>
                  We handle a wide variety of pets, each with their own specific needs and requirements. For dogs and cats, we provide individual attention and care, ensuring they are comfortable and secure during transport. For birds, we use specialized carriers that provide proper ventilation and prevent stress. For fish and aquarium pets, we use specialized containers that maintain water quality and temperature.
                </p>

                <p>
                  For exotic pets and small mammals like rabbits, we have the expertise to handle their unique requirements and ensure they travel safely. Our team is knowledgeable about the specific needs of different species and adapts our care accordingly.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Documentation and Regulatory Compliance</h3>
                
                <p>
                  Pet relocation involves navigating complex regulations and documentation requirements, especially for international moves. Our pet relocation specialists handle all the paperwork, including health certificates, vaccination records, import/export permits, and quarantine requirements. We stay updated on changing regulations for different countries and ensure all documentation is complete and accurate to avoid delays or complications.
                </p>

                <p>
                  We also provide guidance on preparing your pet for travel, including health checks, vaccinations, and acclimating them to their travel crate. Our goal is to make the entire process as smooth and stress-free as possible for both you and your pet.
                </p>

                <h3 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Communication and Peace of Mind</h3>
                
                <p>
                  We understand that not knowing how your pet is doing during travel can be stressful. That's why we provide regular updates throughout the journey, including photos and status reports. You can contact our pet relocation team at any time with questions or concerns, and we're always available to provide reassurance and information about your pet's well-being.
                </p>

                <p>
                  Don't trust your beloved pet to just any relocation service. Contact Panya Global today to learn more about our professional pet relocation services and let our experienced team care for your furry family member with the love and attention they deserve. We're committed to ensuring your pet's safe, comfortable, and stress-free journey to their new home.
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
                Why Choose Our <span className="text-secondary">Pet Relocation</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We understand pets are family. Our trained professionals ensure their comfort and safety.
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

        {/* Pet Types */}
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
                We Relocate <span className="text-secondary">All Pets</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From dogs and cats to exotic pets, we handle all with love and care.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {petTypes.map((pet, index) => (
                <motion.div
                  key={pet.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-3">{pet.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1">
                    {pet.type}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {pet.description}
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
                Our <span className="text-secondary">Pet Relocation</span> Process
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A caring 5-step process ensuring your pet's comfort and safety.
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
                  Comprehensive Pet Relocation Services
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
                  Ready to Relocate Your Pet?
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Get a customized quote for your furry friend. We ensure they travel safely and comfortably.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
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

export default PetRelocation;
