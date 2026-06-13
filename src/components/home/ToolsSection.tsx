import { motion } from "framer-motion";
import {
  Home,
  Building2,
  GraduationCap,
  Wrench,
  ArrowRight,
  MapPin,
  Truck,
  Globe,
  Car,
  PawPrint,
  Warehouse,
  Server,
  Factory,
  Search,
  Key,
  Bug,
  Sparkles,
  Hammer,
  HeartPulse,
  FlaskConical,
  Palette,
  Briefcase,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

// Import local images
import heroFineArt from "@/assets/services/hero-fine-art.webp";
import heroCorporate from "@/assets/services/hero-corporate.webp";
import homePacking from "@/assets/gallery/home-packing.webp";
import crewOfficePacking from "@/assets/gallery/crew-office-packing.webp";
import crewLinkedin from "@/assets/gallery/crew-linkedin.webp";
import handymanServices from "@/assets/services/handyman-services.webp";
import homeRelocation from "@/assets/services/home-relocation.webp";
import officeRelocationCover from "@/assets/services/office-relocation-cover.webp";
import workplaceRelocation from "@/assets/services/workplace-relocation.webp";
import homePackingCouple from "@/assets/services/home-packing-couple.webp";

const ToolsSection = () => {

  const serviceCategories = [
    {
      icon: Home,
      title: "Home Relocation",
      description: "Complete residential moving solutions for local, interstate, and international moves.",
      color: "from-blue-500 to-cyan-500",
      href: "/services",
      image: homeRelocation,
      services: [
        { name: "Local Moving", icon: MapPin },
        { name: "Long Distance", icon: Truck },
        { name: "International", icon: Globe },
        { name: "Vehicle Transport", icon: Car },
        { name: "Pet Relocation", icon: PawPrint },
        { name: "Storage", icon: Warehouse },
      ],
    },
    {
      icon: GraduationCap,
      title: "Mobility Services",
      description: "End-to-end mobility support including school search, house hunting, and more.",
      color: "from-emerald-500 to-teal-500",
      href: "/services/corporate-services",
      image: homePackingCouple,
      services: [
        { name: "School Search", icon: GraduationCap },
        { name: "House Hunting", icon: Search },
        { name: "Car Rental", icon: Key },
      ],
    },
    {
      icon: Building2,
      title: "Workplace Relocation",
      description: "Corporate, office, and industrial relocation with minimal business disruption.",
      color: "from-violet-500 to-purple-500",
      href: "/workspace-relocation",
      image: workplaceRelocation,
      services: [
        { name: "Office Relocation", icon: Building2 },
        { name: "IT & Data Center", icon: Server },
        { name: "Industrial", icon: Factory },
        { name: "Healthcare", icon: HeartPulse },
        { name: "Lab Relocation", icon: FlaskConical },
        { name: "Workspace Solutions", icon: Wrench },
      ],
    },
    {
      icon: Briefcase,
      title: "B2B Corporate",
      description: "End-to-end corporate mobility with dedicated account management.",
      href: "/services/corporate-services",
      image: crewLinkedin, // Requested: LinkedIn Crew Image
      color: "from-emerald-500 to-teal-500",
      services: [
        { name: "Employee Relocation", icon: Briefcase },
        { name: "Policy Management", icon: Briefcase },
        { name: "Expense Tracking", icon: Briefcase },
        { name: "Global Mobility", icon: Globe },
      ],
    },
    {
      icon: Palette,
      title: "Fine Art & Antiques",
      description: "Museum-grade care with climate-controlled transport and custom crating.",
      href: "/services/fine-art",
      image: heroFineArt, // Local asset
      color: "from-emerald-500 to-teal-500",
      services: [
        { name: "Art Relocation", icon: Palette },
        { name: "Antique Moving", icon: Palette },
        { name: "Custom Crating", icon: Warehouse },
        { name: "Climate Control", icon: Palette },
      ],
    },
    {
      icon: Wrench,
      title: "Additional Services",
      description: "Home maintenance services including pest control, cleaning, and handyman work.",
      color: "from-orange-500 to-amber-500",
      href: "/services",
      image: handymanServices, // Local asset
      services: [
        { name: "Pest Control", icon: Bug },
        { name: "Exit Cleaning", icon: Sparkles },
        { name: "Handyman", icon: Hammer },
      ],
    },
  ];

  const processSteps = [
    { number: "01", title: "Book Your Order", description: "Get a free quote and confirm your booking" },
    { number: "02", title: "Pack Your Things", description: "Our experts pack everything safely" },
    { number: "03", title: "Move Your Things", description: "Secure transportation to destination" },
    { number: "04", title: "Deliver Your Things", description: "Unpack and set up at new location" },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden content-visibility-auto">
      {/* Background Decorations */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-bl from-secondary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Process Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our process is superfast with skilled and experienced staff and fast delivery on time services.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 transition-all duration-300 group h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  className="text-5xl font-heading font-bold text-secondary/20 group-hover:text-secondary/60 transition-colors mb-4 relative z-10"
                  whileHover={{ scale: 1.15, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2 relative z-10 group-hover:text-secondary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm relative z-10">{step.description}</p>
              </div>

              {index < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-secondary/50 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Services Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Complete{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Relocation</span>{" "}
            Solutions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional services at affordable rates, to suit your pocket and soothe your mind.
          </p>
        </motion.div>

        {/* Service Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {serviceCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                  {/* Category Icon Badge */}
                  <motion.div
                    className={`absolute bottom-4 left-6 w-14 h-14 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <h3 className="font-heading text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors relative z-10">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed relative z-10">
                    {category.description}
                  </p>

                  {/* Services List - Show max 6 */}
                  {(() => {
                    const visibleServices = category.services.slice(0, 6);
                    return (
                      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                        {visibleServices.map((service, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <service.icon className="w-3.5 h-3.5 text-secondary" />
                            <span>{service.name}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* View More Link */}
                  <Link
                    to={category.href}
                    className="inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all group/link relative z-10"
                  >
                    Explore Services
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Services */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all group"
          >
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ToolsSection;
