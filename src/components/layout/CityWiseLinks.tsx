import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Truck, Building2 } from "lucide-react";
import { locations } from "@/data/locations";

/* -----------------------------
   DATA PREP
----------------------------- */

const majorCities = locations
  .map((loc) => ({ city: loc.city, slug: loc.slug }))
  .sort((a, b) => a.city.localeCompare(b.city));

const metroCities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
];

const interstateRoutes = metroCities
  .flatMap((from) => {
    const fromLoc = locations.find((l) => l.city === from);
    if (!fromLoc) return [];
    return locations
      .filter((l) => l.city !== from && metroCities.includes(l.city))
      .slice(0, 6)
      .map((to) => ({
        from,
        to: to.city,
        fromSlug: fromLoc.slug,
        toSlug: to.slug,
      }));
  })
  .slice(0, 35);

/* -----------------------------
   ANIMATION VARIANTS
----------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

/* -----------------------------
   COMPONENT
----------------------------- */

const CityWiseLinks = () => {
  return (
    <section className="relative overflow-hidden">
      {/* =====================================================
          CITY WISE LINKS (DARK)
      ===================================================== */}
      <div className="bg-primary relative">
        <div className="container mx-auto px-4 py-10 sm:py-14 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary-foreground">
              City Wise Links
            </h2>
          </div>

          {/* Cities Grid — CSS grid, auto-flows naturally on all screen sizes */}
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-1.5 list-none p-0 m-0"
          >
            {majorCities.map((city) => (
              <motion.li key={city.slug} variants={itemVariants}>
                <Link
                  to={["delhi", "gurgaon", "noida"].includes(city.slug) ? `/packers-movers-${city.slug}` : `/packers-movers/${city.slug}`}
                  className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-secondary transition-colors py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-secondary flex-shrink-0" />
                  <span className="truncate">Packers &amp; Movers {city.city}</span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* View All */}
          <div className="mt-6 text-center">
            <Link
              to="/sitemap"
              className="inline-flex items-center gap-2 text-secondary text-sm font-medium hover:underline"
            >
              View all {locations.length}+ cities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          INTERSTATE LINKS (LIGHT)
      ===================================================== */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground">
              Interstate Relocation Services
            </h2>
          </div>

          {/* Routes Grid */}
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-1.5 list-none p-0 m-0"
          >
            {interstateRoutes.map((route, idx) => (
              <motion.li
                key={`${route.from}-${route.to}-${idx}`}
                variants={itemVariants}
              >
                <Link
                  to={["delhi", "gurgaon", "noida"].includes(route.fromSlug) ? `/packers-movers-${route.fromSlug}` : `/packers-movers/${route.fromSlug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-primary flex-shrink-0" />
                  <span className="truncate">
                    Packers &amp; Movers {route.from} to {route.to}
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Bottom CTA */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pan India Coverage
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              {locations.length}+ Cities
            </div>
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Get Free Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityWiseLinks;
