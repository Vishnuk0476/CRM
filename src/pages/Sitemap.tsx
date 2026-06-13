import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Home, 
  Info, 
  Briefcase, 
  Phone, 
  FileText, 
  Image, 
  Users, 
  Star, 
  BookOpen,
  MapPin,
  CreditCard,
  Shield,
  Handshake,
  HelpCircle,
  Lock,
  FileCheck,
  Map,
  Truck,
  Globe,
  Car,
  PawPrint,
  Warehouse,
  Building2,
  Server,
  Factory,
  GraduationCap,
  Search,
  Key,
  Bug,
  Sparkles,
  Hammer,
  Wrench,
  Recycle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { locations } from "@/data/locations";

// Generate location links from locations data
const locationLinks = locations.map((loc) => ({
  name: `Packers & Movers in ${loc.city}`,
  href: `/packers-movers/${loc.slug}`,
  icon: MapPin,
}));

const sitemapSections = [
  {
    title: "Main Pages",
    links: [
      { name: "Home", href: "/", icon: Home },
      { name: "About Us", href: "/about", icon: Info },
      { name: "All Services", href: "/services", icon: Briefcase },
      { name: "Contact Us", href: "/contact", icon: Phone },
      { name: "Get Quote", href: "/quote", icon: FileText },
      { name: "Gallery", href: "/gallery", icon: Image },
    ],
  },
  {
    title: "Home Relocation",
    links: [
      { name: "Local Moving", href: "/services/local-moving", icon: MapPin },
      { name: "Long Distance Moving", href: "/services/long-distance", icon: Truck },
      { name: "International Moving", href: "/services/international", icon: Globe },
      { name: "Vehicle Transport", href: "/services/vehicle-transport", icon: Car },
      { name: "Pet Relocation", href: "/services/pet-relocation", icon: PawPrint },
      { name: "Storage Services", href: "/services/storage", icon: Warehouse },
    ],
  },
  {
    title: "Workplace Relocation",
    links: [
      { name: "Office Relocation", href: "/services/office-relocation", icon: Building2 },
      { name: "IT & Data Center", href: "/services/it-datacenter", icon: Server },
      { name: "Industrial Relocation", href: "/services/industrial", icon: Factory },
      { name: "Healthcare Relocation", href: "/services/healthcare", icon: Building2 },
      { name: "Lab Relocation", href: "/services/lab-relocation", icon: Server },
      { name: "Scrap Service", href: "/services/scrap-service", icon: Recycle },
    ],
  },
  {
    title: "Mobility Services",
    links: [
      { name: "School Search", href: "/services/school-search", icon: GraduationCap },
      { name: "House Search", href: "/services/house-search", icon: Search },
      { name: "Car Rental", href: "/services/car-rental", icon: Key },
    ],
  },
  {
    title: "★ Premium Services",
    links: [
      { name: "Fine Art & Antique Relocation", href: "/services/fine-art", icon: Sparkles },
      { name: "B2B Corporate Services", href: "/services/corporate-services", icon: Briefcase },
    ],
  },
  {
    title: "Additional Services",
    links: [
      { name: "Pest Control", href: "/services/pest-control", icon: Bug },
      { name: "Exit Clean Service", href: "/services/exit-clean", icon: Sparkles },
      { name: "Handyman Services", href: "/services/handyman", icon: Hammer },
    ],
  },
  {
    title: "Customer Resources",
    links: [
      { name: "Our Clients", href: "/clients", icon: Users },
      { name: "Reviews", href: "/reviews", icon: Star },
      { name: "Download Brochure", href: "/brochure", icon: BookOpen },
      { name: "Track Consignment", href: "/track", icon: MapPin },
      { name: "Track Quote", href: "/track-quote", icon: FileText },
      { name: "Pay Online", href: "/pay", icon: CreditCard },
      { name: "Detect Fraud", href: "/detect-fraud", icon: Shield },
    ],
  },
  {
    title: "Partner & Support",
    links: [
      { name: "Become a Partner", href: "/partner", icon: Handshake },
      { name: "View Branches", href: "/branches", icon: Map },
      { name: "FAQ", href: "/faq", icon: HelpCircle },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy", icon: Lock },
      { name: "Terms of Service", href: "/terms", icon: FileCheck },
      { name: "Sitemap", href: "/sitemap", icon: Map },
    ],
  },
];

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Sitemap
              </h1>
              <p className="text-primary-foreground/80">
                Complete overview of all pages on our website
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sitemap Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {sitemapSections.map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: sectionIndex * 0.1 }}
                  >
                    <h2 className="font-heading text-xl font-bold text-foreground mb-6 pb-2 border-b border-border">
                      {section.title}
                    </h2>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            to={link.href}
                            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                          >
                            <link.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Location Pages Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-16"
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-8 pb-3 border-b border-border">
                  Service Locations ({locationLinks.length} Cities)
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {locationLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <MapPin className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors flex-shrink-0" />
                      <span className="text-sm">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Sitemap;
