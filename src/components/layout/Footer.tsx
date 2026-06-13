import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  X,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  ChevronRight,
  Send,
  HeadphonesIcon,
  Truck,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/* ================= DATA ================= */

const CONTACT_NUMBERS = [
  { label: "Mobile", value: "8800890802", tel: "tel:8800890802" },
  { label: "Mobile", value: "8800331157", tel: "tel:8800331157" },
  { label: "Mobile", value: "8800264232", tel: "tel:8800264232" },
  { label: "Landline", value: "+91 11 4155 6447", tel: "tel:+911141556447" },
];

const footerLinks = {
  services: [
    { name: "Local Moving", href: "/services/local-moving" },
    { name: "Long Distance Moving", href: "/services/long-distance" },
    { name: "International Moving", href: "/services/international" },
    { name: "Office Relocation", href: "/services/office-relocation" },
    { name: "Vehicle Transport", href: "/services/vehicle-transport" },
    { name: "Storage Services", href: "/services/storage" },
  ],
  mobility: [
    { name: "School Search", href: "/services/school-search" },
    { name: "House Search", href: "/services/house-search" },
    { name: "Car Rental", href: "/services/car-rental" },
    { name: "Easy Cover Warranty", href: "/easy-cover-warranty" },
  ],
  quickLinks: [
    { name: "About Us", href: "/about" },
    { name: "Clients", href: "/clients" },
    { name: "Gallery", href: "/gallery" },
    { name: "Reviews", href: "/reviews" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com" },
  { icon: X, href: "https://twitter.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Youtube, href: "https://youtube.com" },
];

/* ================= COMPONENT ================= */

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <footer className="bg-primary text-primary-foreground">

      {/* ===== CTA STRIP ===== */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-heading font-bold">
              Ready to <span className="text-secondary">Relocate</span>?
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Get a FREE quote today.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/quote">
              <Button size="lg">
                Get Free Quote <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <a href="tel:+911141556447">
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Phone className="w-4 h-4 mr-1" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ===== MAIN FOOTER ===== */}
      <div className="container mx-auto px-4 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

          {/* ABOUT + CONTACT */}
          <div className="lg:col-span-2">
            <p className="text-sm text-primary-foreground/80 mb-5">
              India’s trusted packers & movers since 2010. ISO-certified
              relocation services across 280+ cities.
            </p>

            {/* CONTACT NUMBERS */}
            <div className="mb-5">
              <h4 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                <HeadphonesIcon className="w-4 h-4 text-secondary" />
                Call Us
              </h4>

              <div className="flex flex-wrap gap-2">
                {CONTACT_NUMBERS.map((num) => (
                  <a 
                    key={num.value}
                    href={num.tel}
                    className="flex items-center gap-2 text-sm bg-primary-foreground/10 px-3 py-1.5 rounded-lg border border-primary-foreground/20 hover:border-secondary hover:text-white transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    {num.value}
                  </a>
                ))}
              </div>
            </div>

            {/* EMAIL */}
            <a 
              href="mailto:info@panyaglobal.in"
              className="flex items-center gap-2 text-sm hover:text-secondary mb-4"
            >
              <Mail className="w-4 h-4" />
              info@panyaglobal.in
            </a>

            {/* NEWSLETTER */}
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-3">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button size="icon" aria-label="Subscribe to newsletter">
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {subscribed && (
              <p className="text-green-300 text-sm mb-3">
                Thanks for subscribing!
              </p>
            )}

            {/* ADDRESS */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-secondary mt-0.5" />
              <span>18/1, Basement, Village Samalkha, New Delhi-110037</span>
            </div>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((s, i) => (
                <a 
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary transition"
                  aria-label={`Visit our social media page`}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          <FooterColumn title="Services" icon={Truck} links={footerLinks.services} />
          <FooterColumn title="Mobility" icon={Globe} links={footerLinks.mobility} />
          <FooterColumn title="Quick Links" icon={Zap} links={footerLinks.quickLinks} />

        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Panya Global Relocation Pvt. Ltd.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* ===== SCROLL TO TOP (DESKTOP ONLY) ===== */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="hidden sm:flex fixed bottom-6 right-6 w-11 h-11 bg-secondary text-secondary-foreground rounded-full items-center justify-center shadow-lg hover:scale-110 transition"
        aria-label="Scroll to top of page"
      >
        <ArrowRight className="w-5 h-5 -rotate-90" />
      </button>

    </footer>
  );
};

/* ================= COLUMN COMPONENT ================= */

const FooterColumn = ({
  title,
  icon: Icon,
  links,
}: {
  title: string;
  icon: any;
  links: { name: string; href: string }[];
}) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-secondary" />
      <h4 className="font-heading font-bold text-sm">{title}</h4>
    </div>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.name}>
          <Link
            to={link.href}
            className="text-sm text-primary-foreground/75 hover:text-white flex items-center gap-2"
          >
            <ChevronRight className="w-3 h-3 text-secondary" />
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default Footer;
