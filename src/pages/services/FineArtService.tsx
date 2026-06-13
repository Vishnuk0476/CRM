import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  Shield, 
  Award, 
  CheckCircle2, 
  Palette, 
  Thermometer,
  Package,
  Truck,
  Camera,
  Lock,
  Globe,
  Star,
  ArrowRight,
  Clock,
  Users,
  FileCheck,
  Warehouse,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import heroImage from "@/assets/services/hero-fine-art.webp";

const stats = [
  { icon: Clock, value: "16+", label: "Years in Art Handling" },
  { icon: Palette, value: "1,000+", label: "Artworks Relocated" },
  { icon: Shield, value: "Zero", label: "Damage Record" },
  { icon: Award, value: "Certified", label: "International Art Shipping" },
];

const artTypes = [
  { icon: "🖼️", name: "Paintings", description: "Oil, acrylic, watercolor, canvas" },
  { icon: "🗿", name: "Sculptures", description: "Marble, bronze, wood, metal" },
  { icon: "🏺", name: "Antiques", description: "Antiques and artifacts" },
  { icon: "🪞", name: "Glass Art", description: "Mirrors and glass art" },
  { icon: "📜", name: "Manuscripts", description: "Rare manuscripts and documents" },
  { icon: "🎭", name: "Installation Art", description: "Contemporary installations" },
  { icon: "💎", name: "Collectibles", description: "Collectibles and valuables" },
  { icon: "🏛️", name: "Museum Pieces", description: "Museum-grade artworks" },
];

const packingTechniques = [
  {
    title: "Climate-Controlled Packing",
    icon: Thermometer,
    features: [
      "Temperature and humidity monitoring",
      "Acid-free materials",
      "UV-protective wrapping",
      "Silica gel moisture control",
      "Custom-built wooden crates",
    ],
  },
  {
    title: "Professional Art Handling",
    icon: Package,
    features: [
      "White-glove service",
      "Art handler trained professionals",
      "Specialized lifting equipment",
      "Climate-controlled vehicles",
      "Shock-absorbing packaging",
      "Custom crating for each piece",
    ],
  },
];

const services = [
  "Pre-move art appraisal coordination",
  "Condition report documentation",
  "Professional photography (before/after)",
  "Custom crate design and fabrication",
  "Climate-controlled transportation",
  "Art installation service",
  "Storage in art-grade facilities",
  "Insurance coordination (up to ₹10 Crore)",
];

const internationalServices = [
  "Export documentation",
  "Customs clearance for artworks",
  "Certificate of Authenticity handling",
  "Import permits",
  "Fumigation certificates",
  "Destination white-glove delivery",
];

const clientele = [
  "Private art collectors",
  "Art galleries and dealers",
  "Museums and cultural institutions",
  "Corporate art collections",
  "Interior designers",
  "Auction houses",
];

const storageFeatures = [
  { icon: Thermometer, text: "Climate-controlled vault (18-22°C, 45-55% humidity)" },
  { icon: Sparkles, text: "UV-filtered lighting" },
  { icon: Lock, text: "24/7 armed security" },
  { icon: Camera, text: "CCTV surveillance" },
  { icon: Shield, text: "Fire suppression system" },
  { icon: Warehouse, text: "Individual climate zones" },
  { icon: FileCheck, text: "Art insurance available" },
];

const testimonials = [
  {
    quote: "Panya's fine art team relocated our ₹2 Crore MF Husain painting from Mumbai to Delhi. Museum-grade service!",
    author: "Rahul Mehta",
    role: "Art Collector",
  },
  {
    quote: "Our gallery trusts only Panya Global for exhibition logistics. Impeccable handling!",
    author: "Akriti Art Gallery",
    role: "Bangalore",
  },
];

const formFields: Array<{
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}> = [
  { id: "name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true },
  { id: "email", label: "Email Address", type: "email", placeholder: "your@email.com", required: true },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 XXXXX XXXXX", required: true },
  { id: "artworkType", label: "Artwork Type", type: "select", options: [
    { value: "painting", label: "Painting" },
    { value: "sculpture", label: "Sculpture" },
    { value: "antique", label: "Antique" },
    { value: "glass-art", label: "Glass Art" },
    { value: "manuscript", label: "Manuscript" },
    { value: "installation-art", label: "Installation Art" },
    { value: "collectible", label: "Collectible" },
    { value: "museum-piece", label: "Museum Piece" },
    { value: "other", label: "Other" }
  ], required: true },
  { id: "dimensions", label: "Approximate Dimensions", type: "text", placeholder: "e.g., 4ft x 3ft", required: true },
  { id: "estimatedValue", label: "Estimated Value Range", type: "select", options: [
    { value: "under-1-lakh", label: "Under ₹1 Lakh" },
    { value: "1-5-lakhs", label: "₹1-5 Lakhs" },
    { value: "5-25-lakhs", label: "₹5-25 Lakhs" },
    { value: "25-50-lakhs", label: "₹25-50 Lakhs" },
    { value: "50-lakhs-1-crore", label: "₹50 Lakhs - ₹1 Crore" },
    { value: "above-1-crore", label: "Above ₹1 Crore" }
  ], required: true },
  { id: "fromLocation", label: "Pickup Location", type: "text", placeholder: "City, State", required: true },
  { id: "toLocation", label: "Delivery Location", type: "text", placeholder: "City, State or Country", required: true },
  { id: "serviceType", label: "Service Required", type: "select", options: [
    { value: "local", label: "Local Relocation" },
    { value: "domestic-long-distance", label: "Domestic Long Distance" },
    { value: "international", label: "International Shipping" },
    { value: "storage", label: "Storage Only" },
    { value: "exhibition", label: "Exhibition Logistics" },
    { value: "multiple", label: "Multiple Artworks" }
  ], required: true },
  { id: "insuranceRequired", label: "Insurance Required?", type: "select", options: [
    { value: "full-coverage", label: "Yes, full coverage" },
    { value: "basic-coverage", label: "Yes, basic coverage" },
    { value: "own-insurance", label: "I have my own insurance" },
    { value: "need-consultation", label: "Need consultation" }
  ], required: true },
  { id: "additionalServices", label: "Additional Services Needed", type: "textarea", placeholder: "E.g., Photography, appraisal coordination, installation, custom crating requirements..." },
];

const FineArtService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 min-h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30 text-sm px-4 py-1">
                <Star className="w-4 h-4 mr-1 inline" /> PREMIUM SERVICE
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                🎨 Fine Art & Antique Relocation
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-4">
                India's Most Specialized Fine Art Moving Service
              </p>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                A white-glove service for art collectors, galleries, museums, and connoisseurs. 
                Our fine art division handles priceless artworks with museum-grade care.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Button size="lg" variant="secondary" asChild>
                  <a href="tel:+918800446447">
                    <Phone className="w-5 h-5 mr-2" />
                    Art Specialist: 8800446447
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <a href="mailto:info@panyaglobal.in">
                    <Mail className="w-5 h-5 mr-2" />
                    info@panyaglobal.in
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 px-3 py-1">
                  <Shield className="w-4 h-4 mr-1" /> Easy Cover
                </Badge>
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 px-3 py-1">
                  <Thermometer className="w-4 h-4 mr-1" /> Climate Controlled
                </Badge>
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 px-3 py-1">
                  <Sparkles className="w-4 h-4 mr-1" /> White-Glove Service
                </Badge>
                <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 px-3 py-1">
                  <Package className="w-4 h-4 mr-1" /> Custom Crating
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        <EasyCoverBanner />

        {/* Stats Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Transport */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                What We Transport
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From priceless paintings to delicate sculptures, we handle every piece with museum-grade care
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {artTypes.map((art, index) => (
                <motion.div
                  key={art.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <span className="text-4xl mb-3 block">{art.icon}</span>
                      <h3 className="font-semibold text-foreground mb-1">{art.name}</h3>
                      <p className="text-sm text-muted-foreground">{art.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialized Packing Techniques */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Specialized Packing Techniques
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Museum-approved methods ensuring your artwork's complete protection
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {packingTechniques.map((technique, index) => (
                <motion.div
                  key={technique.title}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <technique.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-heading text-xl font-bold text-foreground">
                          {technique.title}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {technique.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Include */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Comprehensive Services
                </h2>
                <p className="text-muted-foreground mb-8">
                  End-to-end art relocation services designed for complete peace of mind
                </p>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <div key={service} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="w-8 h-8 text-primary" />
                      <h3 className="font-heading text-2xl font-bold text-foreground">
                        International Art Shipping
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Expert handling for cross-border art movements with full documentation support
                    </p>
                    <ul className="space-y-3">
                      {internationalServices.map((service) => (
                        <li key={service} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Art Storage Facility */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Art Storage Facility
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                State-of-the-art climate-controlled storage designed specifically for fine art
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {storageFeatures.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background border"
                >
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Clientele */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our Clientele
                </h2>
                <p className="text-muted-foreground mb-8">
                  Trusted by India's most discerning art collectors and institutions
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {clientele.map((client) => (
                    <div key={client} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground text-sm">{client}</span>
                    </div>
                  ))}
                </div>

                <Card className="mt-8 bg-secondary/5 border-secondary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-secondary" />
                      Special Offer for Galleries
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Annual contracts available</li>
                      <li>• Volume discounts</li>
                      <li>• Exhibition logistics support</li>
                      <li>• Rotation services</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                        ))}
                      </div>
                      <p className="text-foreground italic mb-4">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Request a Fine Art Consultation
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our art specialists will assess your requirements and provide a customized solution
                </p>
              </motion.div>

              <ServiceInquiryForm
                serviceName="Fine Art & Antique Relocation"
                serviceType="fine-art"
                fields={formFields}
                additionalInfo={[
                  "Fine art moving is priced based on artwork dimensions, material fragility, distance, insurance value, and packing complexity.",
                  "Our specialist will contact you within 24 hours for a detailed assessment."
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready to Move Your Precious Art?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Contact our Fine Art Division for a personalized consultation
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <a href="tel:+918800446447">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Art Specialist
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/quote">
                    Get Free Quote <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default FineArtService;
