import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail, Sparkles, Shield, Truck, Clock } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

interface PremiumCTAProps {
  title?: string;
  subtitle?: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  tertiaryText?: string;
  tertiaryHref?: string;
  variant?: "hero" | "section" | "sticky" | "card" | "minimal";
  className?: string;
  icons?: boolean;
}

const iconMap = {
  quote: ArrowRight,
  phone: Phone,
  email: Mail,
  sparkles: Sparkles,
  shield: Shield,
  truck: Truck,
  clock: Clock,
};

const variantStyles = {
  hero: "px-10 py-6 rounded-2xl gap-6",
  section: "px-8 py-4 rounded-xl gap-4",
  sticky: "px-6 py-3 rounded-xl gap-3",
  card: "px-6 py-4 rounded-xl gap-4",
  minimal: "px-4 py-2 rounded-lg gap-2",
};

const titleStyles = {
  hero: "text-3xl md:text-4xl font-heading font-bold",
  section: "text-2xl md:text-3xl font-heading font-bold",
  sticky: "hidden md:block text-lg font-semibold",
  card: "text-xl font-heading font-bold",
  minimal: "hidden",
};

const subtitleStyles = {
  hero: "text-lg md:text-xl text-muted-foreground max-w-2xl",
  section: "text-base text-muted-foreground max-w-xl",
  sticky: "hidden",
  card: "text-sm text-muted-foreground",
  minimal: "hidden",
};

export const PremiumCTA = ({
  title,
  subtitle,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  tertiaryText,
  tertiaryHref,
  variant = "section",
  className = "",
  icons = true,
}: PremiumCTAProps) => {
  const PrimaryIcon = icons ? ArrowRight : null;
  const SecondaryIcon = icons && secondaryHref ? Phone : null;
  const TertiaryIcon = icons && tertiaryHref ? Mail : null;

  return (
    <motion.div
      className={`flex flex-col sm:flex-row items-center justify-center gap-4 w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {(title || subtitle) && (
        <div className="text-center sm:text-left mb-2 sm:mb-0 flex-1">
          {title && <h3 className={titleStyles[variant]}>{title}</h3>}
          {subtitle && <p className={subtitleStyles[variant]}>{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
        <Button
          asChild
          variant="premium"
          size={variant === "hero" ? "xl" : variant === "sticky" ? "lg" : "lg"}
          className={variantStyles[variant]}
        >
          <Link to={primaryHref}>
            {primaryText}
            {icons && <PrimaryIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
          </Link>
        </Button>

        {secondaryText && secondaryHref && (
          <Button
            asChild
            variant="outline"
            size={variant === "hero" ? "xl" : variant === "sticky" ? "lg" : "lg"}
            className={`${variantStyles[variant]} border-secondary/50 hover:bg-secondary/10`}
          >
            <Link to={secondaryHref} className="flex items-center gap-2">
              {icons && <SecondaryIcon className="w-5 h-5" />}
              {secondaryText}
            </Link>
          </Button>
        )}

        {tertiaryText && tertiaryHref && (
          <Button
            asChild
            variant="ghost"
            size={variant === "hero" ? "xl" : variant === "sticky" ? "lg" : "lg"}
            className={variantStyles[variant]}
          >
            <Link to={tertiaryHref} className="flex items-center gap-2">
              {icons && <TertiaryIcon className="w-5 h-5" />}
              {tertiaryText}
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export const StickyCTA = () => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl p-4 safe-area-bottom"
  >
    <PremiumCTA
      variant="sticky"
      primaryText="Get Free Quote"
      primaryHref="/quote"
      secondaryText="Call Now"
      secondaryHref="tel:+911141556447"
      icons
    />
  </motion.div>
);

export const HeroCTA = () => (
  <PremiumCTA
    variant="hero"
    title="Ready for a Stress-Free Move?"
    subtitle="Join 9,600+ satisfied customers. Get your personalized quote in 2 minutes."
    primaryText="Get Free Quote"
    primaryHref="/quote"
    secondaryText="Call Expert"
    secondaryHref="tel:+911141556447"
    icons
  />
);

export const SectionCTA = ({ title, subtitle, primaryText = "Get Quote", primaryHref = "/quote", secondaryText = "View Services", secondaryHref = "/services" }: Omit<PremiumCTAProps, "variant">) => (
  <PremiumCTA
    variant="section"
    title={title}
    subtitle={subtitle}
    primaryText={primaryText}
    primaryHref={primaryHref}
    secondaryText={secondaryText}
    secondaryHref={secondaryHref}
    icons
  />
);

export const CardCTA = ({ primaryText = "Learn More", primaryHref = "/services", title }: Omit<PremiumCTAProps, "variant">) => (
  <PremiumCTA
    variant="card"
    title={title}
    primaryText={primaryText}
    primaryHref={primaryHref}
    icons
  />
);