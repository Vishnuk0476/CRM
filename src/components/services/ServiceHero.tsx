import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceHeroProps {
  title: string;
  highlightedText: string;
  description: string;
  badgeText: string;
  badgeIcon: LucideIcon;
  heroImage: string;
  ctaText?: string;
  ctaLink?: string;
  phoneNumber?: string;
}

const ServiceHero = ({
  title,
  highlightedText,
  description,
  badgeText,
  badgeIcon: BadgeIcon,
  heroImage,
  ctaText = "Get Free Quote",
  ctaLink = "/quote",
  phoneNumber = "+91 11 4155 6447",
}: ServiceHeroProps) => {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden min-h-[600px] flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
            <BadgeIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{badgeText}</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            {title} <span className="text-secondary">{highlightedText}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ctaLink}>
              <Button size="lg" variant="hero" className="gap-2">
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href={`tel:${phoneNumber.replace(/\s/g, "")}`}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Call {phoneNumber}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceHero;
