import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  Mail,
  ArrowRight,
  Home,
  Building2,
  GraduationCap,
  Wrench,
  MapPin,
  Car,
  PawPrint,
  Warehouse,
  Globe,
  Server,
  Factory,
  Search,
  Key,
  Bug,
  Sparkles,
  Hammer,
  Truck,
  Briefcase,
  Recycle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/logo-white.webp";
import logoBlack from "@/assets/logo-black.webp";

interface ServiceItem {
  name: string;
  href: string;
  description: string;
  icon: React.ElementType;
}

interface MegaMenuCategory {
  name: string;
  href: string;
  description: string;
  icon: React.ElementType;
  color: string;
  services: ServiceItem[];
}

// Premium services - standalone highlighted services
const premiumServices = [
  {
    name: "Fine Art & Antique",
    href: "/services/fine-art",
    description: "Museum-grade white-glove handling",
    icon: Sparkles,
    color: "from-amber-500 to-yellow-500",
    badge: "Premium",
  },
  {
    name: "B2B Corporate",
    href: "/services/corporate-services",
    description: "HR & Employee Mobility Solutions",
    icon: Briefcase,
    color: "from-sky-500 to-indigo-500",
    badge: "Enterprise",
  },
];

const megaMenuData: MegaMenuCategory[] = [
  {
    name: "Home Relocation",
    href: "/services",
    description: "Complete residential moving solutions",
    icon: Home,
    color: "from-blue-500 to-cyan-500",
    services: [
      {
        name: "Local Moving",
        href: "/services/local-moving",
        description: "City-wide relocation services",
        icon: MapPin,
      },
      {
        name: "Long Distance",
        href: "/services/long-distance",
        description: "Interstate moving solutions",
        icon: Truck,
      },
      {
        name: "International",
        href: "/services/international",
        description: "Overseas relocation experts",
        icon: Globe,
      },
      {
        name: "Vehicle Transport",
        href: "/services/vehicle-transport",
        description: "Safe vehicle shipping",
        icon: Car,
      },
      {
        name: "Pet Relocation",
        href: "/services/pet-relocation",
        description: "Stress-free pet moving",
        icon: PawPrint,
      },
      { name: "Storage Services", href: "/services/storage", description: "Secure storage solutions", icon: Warehouse },
    ],
  },
  {
    name: "Workplace",
    href: "/services",
    description: "Corporate & industrial relocation",
    icon: Building2,
    color: "from-violet-500 to-purple-500",
    services: [
      {
        name: "Office Relocation",
        href: "/services/office-relocation",
        description: "Seamless office moves",
        icon: Building2,
      },
      {
        name: "IT & Data Center",
        href: "/services/it-datacenter",
        description: "Tech infrastructure moves",
        icon: Server,
      },
      { name: "Industrial", href: "/services/industrial", description: "Factory & warehouse moves", icon: Factory },
      { name: "Healthcare", href: "/services/healthcare", description: "Hospital & clinic moves", icon: Building2 },
      {
        name: "Lab Relocation",
        href: "/services/lab-relocation",
        description: "Laboratory equipment moves",
        icon: Server,
      },
      {
        name: "Scrap Service",
        href: "/services/scrap-service",
        description: "Corporate scrap disposal",
        icon: Recycle,
      },
    ],
  },
  {
    name: "Mobility",
    href: "/services",
    description: "End-to-end mobility support",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
    services: [
      {
        name: "School Search",
        href: "/services/school-search",
        description: "Find the right school",
        icon: GraduationCap,
      },
      { name: "House Search", href: "/services/house-search", description: "Property search assistance", icon: Search },
      { name: "Car Rental", href: "/services/car-rental", description: "Vehicle rental services", icon: Key },
    ],
  },
  {
    name: "Additional",
    href: "/services",
    description: "Home maintenance services",
    icon: Wrench,
    color: "from-orange-500 to-amber-500",
    services: [
      { name: "Pest Control", href: "/services/pest-control", description: "Professional pest solutions", icon: Bug },
      { name: "Exit Clean Service", href: "/services/exit-clean", description: "End-of-lease cleaning", icon: Sparkles },
      { name: "Handyman Services", href: "/services/handyman", description: "Home repair & maintenance", icon: Hammer },
    ],
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setServicesDropdownOpen(false);
    setExpandedMobileCategory(null);
    setMobileServicesOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services", hasDropdown: true },
    { name: "Gallery", href: "/gallery" },
    { name: "Testimonials", href: "/reviews" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 px-6 md:px-12 lg:px-16 pt-6`}
    >
      <div
        className={`liquid-glass rounded-xl px-4 py-2 flex items-center justify-between transition-all duration-300 w-full mx-auto shadow-lg border border-white/20 overflow-visible`}
      >
        <div className="flex items-center justify-between w-full overflow-visible">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
              <img
                src={logoWhite}
                alt="Panya Global Relocation"
                width={180}
                height={60}
                className={`w-auto transition-all duration-300 h-10 md:h-12`}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 overflow-visible">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <Link
                    to={link.href}
                    className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                      location.pathname.startsWith("/services") || location.pathname === "/workspace-relocation"
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span className="relative">
                      {link.name}
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                          location.pathname.startsWith("/services") ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${servicesDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </Link>

                  {/* Services Mega Dropdown */}
                  <AnimatePresence>
                    {servicesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[900px] bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-[200]"
                      >
                        {/* Premium Services Bar */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-b border-amber-500/20 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider"></span>
                            </div>
                            <div className="flex gap-3">
                              {premiumServices.map((service) => (
                                <Link
                                  key={service.name}
                                  to={service.href}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r hover:opacity-90 transition-opacity border border-transparent hover:border-amber-500/30"
                                  style={{ background: `linear-gradient(to right, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.02))` }}
                                >
                                  <div className={`w-6 h-6 rounded-md bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                                    <service.icon className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-foreground">{service.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{service.description}</p>
                                  </div>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${service.color} text-white`}>
                                    {service.badge}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-0">
                          {megaMenuData.map((category) => (
                            <div key={category.name} className="border-r border-border/30 last:border-r-0">
                              {/* Category Header */}
                              <div className={`bg-gradient-to-r ${category.color} p-4`}>
                                <div className="flex items-center gap-2">
                                  <category.icon className="w-5 h-5 text-white" />
                                  <h3 className="font-bold text-white text-sm">{category.name}</h3>
                                </div>
                              </div>

                              {/* Services List */}
                              <div className="p-3 space-y-1">
                                {category.services.map((service) => (
                                  <Link
                                    key={service.name}
                                    to={service.href}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                                  >
                                    <service.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                      {service.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-t border-border/30">
                          <p className="text-sm text-muted-foreground">Need help choosing? We're here to assist you.</p>
                          <Link to="/contact">
                            <Button size="sm" variant="outline" className="gap-2">
                              Contact Us <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    location.pathname === link.href ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  <span className="relative">
                    {link.name}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                        location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </span>
                </Link>
              ),
            )}
          </div>

          {/* CTA + Phone */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+911141556447" className="flex items-center gap-2 text-white font-semibold text-sm hover:text-white/80 transition-colors">
              <Phone className="w-4 h-4" />
              <span>+91 11 41556447</span>
            </a>
            <Link to="/quote">
              <Button size="sm" className="gap-2 bg-white text-black hover:bg-gray-100 rounded-lg px-6 py-2 font-medium">
                Get Free Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
        </div>
      </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-card rounded-b-2xl shadow-xl border-t border-border/30 max-h-[80vh] overflow-y-auto"
            >
              {/* Mobile Contact Info */}
              <div className="py-3 px-4 bg-primary/5 border-b border-border/30">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <a href="tel:+911141556447" className="flex items-center gap-2 text-primary font-medium">
                    <Phone className="w-4 h-4" />
                    +91 11 41556447
                  </a>
                  <a href="mailto:info@panyaglobal.in" className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    info@panyaglobal.in
                  </a>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <div className="py-2">
                {navLinks.map((link) =>
                  link.hasDropdown ? (
                    <div key={link.name}>
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 font-medium text-foreground hover:bg-primary/5 transition-colors"
                      >
                        {link.name}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-muted/20"
                          >
                            {megaMenuData.map((category) => (
                              <div key={category.name}>
                                <button
                                  onClick={() =>
                                    setExpandedMobileCategory(
                                      expandedMobileCategory === category.name ? null : category.name,
                                    )
                                  }
                                  className="flex items-center justify-between w-full px-6 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <category.icon className="w-4 h-4 text-secondary" />
                                    {category.name}
                                  </div>
                                  <ChevronDown
                                    className={`w-3 h-3 transition-transform ${
                                      expandedMobileCategory === category.name ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>

                                <AnimatePresence>
                                  {expandedMobileCategory === category.name && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden bg-muted/30"
                                    >
                                      {category.services.map((service) => (
                                        <Link
                                          key={service.name}
                                          to={service.href}
                                          className="flex items-center gap-2 px-10 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                        >
                                          <service.icon className="w-3 h-3" />
                                          {service.name}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`block px-4 py-3 font-medium transition-colors ${
                        location.pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-foreground hover:bg-primary/5"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ),
                )}

                {/* Mobile CTA */}
                <div className="px-4 py-4 border-t border-border/30 mt-2">
                  <Link to="/quote" className="block">
                    <Button className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      Get Free Quote
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
