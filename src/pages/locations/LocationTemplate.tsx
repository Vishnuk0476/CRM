import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Phone, CheckCircle, Truck, Shield, Clock, 
  Star, ArrowRight, Building2, Home, Factory, Package,
  Users, Award, ThumbsUp
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import PageTransition from "@/components/layout/PageTransition";
import SectionReveal from "@/components/layout/SectionReveal";
import LocalBusinessSchema from "@/components/SEO/LocalBusinessSchema";
import LocationFAQ from "@/components/locations/LocationFAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LocationData {
  city: string;
  state: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  phoneNumber: string;
  email: string;
  areas: string[];
  nearbyLocations: { name: string; slug: string }[];
}

interface LocationTemplateProps {
  location: LocationData;
}

const services = [
  { icon: Home, title: "Home Relocation", description: "Complete household moving with professional packing" },
  { icon: Building2, title: "Office Relocation", description: "Minimal downtime corporate moves" },
  { icon: Factory, title: "Industrial Moving", description: "Heavy machinery and equipment transport" },
  { icon: Package, title: "Packing & Unpacking", description: "Expert packing with quality materials" },
  { icon: Truck, title: "Vehicle Transport", description: "Safe car and bike transportation" },
  { icon: Shield, title: "Storage Services", description: "Secure warehousing solutions" },
];

const whyChooseUs = [
  { icon: Clock, title: "On-Time Delivery", text: "We value your time and ensure timely delivery" },
  { icon: Shield, title: "Insured Transit", text: "Complete insurance coverage for your belongings" },
  { icon: Users, title: "Trained Staff", text: "Professional and courteous moving team" },
  { icon: Award, title: "15+ Years Experience", text: "Trusted by thousands of families" },
];

const LocationTemplate = ({ location }: LocationTemplateProps) => {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    // Update page meta
    document.title = location.metaTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", location.metaDescription);
    }

    // Fetch location-specific testimonials from PHP API
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`/api/testimonials/list.php?status=approved&admin=0&limit=3&location=${encodeURIComponent(location.city)}`);
        const json = await res.json();
        const items: unknown[] = json.data?.testimonials ?? [];
        if (items.length > 0) {
          setTestimonials(items);
        } else {
          // Fallback: general approved testimonials
          const fallbackRes = await fetch('/api/testimonials/list.php?status=approved&admin=0&order=rating&dir=desc&limit=3');
          const fallbackJson = await fallbackRes.json();
          setTestimonials(fallbackJson.data?.testimonials ?? []);
        }
      } catch {
        // Silently fail — testimonials section simply won't render
      }
    };

    fetchTestimonials();
  }, [location]);

  return (
    <PageTransition>
      <LocalBusinessSchema
        city={location.city}
        state={location.state}
        description={location.description}
        phoneNumber={location.phoneNumber}
        areas={location.areas}
      />
      <div className="min-h-screen">
        <Navbar />
        <main>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 md:py-32">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 bg-cover bg-center" />
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <span className="text-secondary font-medium">{location.state}</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Packers and Movers in {location.city}
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl">
                  {location.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/quote">
                      Get Free Quote <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <a href={`tel:${location.phoneNumber.replace(/\s/g, '')}`}>
                      <Phone className="mr-2 w-5 h-5" /> {location.phoneNumber}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <a href={`mailto:${location.email}`}>
                      ✉️ {location.email}
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Trust Badges */}
          <SectionReveal direction="up">
            <section className="py-8 bg-muted/50 border-b border-border">
              <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-2xl text-foreground">9,500+</div>
                      <div className="text-sm text-muted-foreground">Happy Customers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-2xl text-foreground">4.8/5</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-2xl text-foreground">15+</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* Services Section */}
          <SectionReveal direction="up">
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                    Our Services
                  </span>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Relocation Services in {location.city}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Comprehensive moving solutions tailored to your needs in {location.city} and surrounding areas.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow group">
                        <CardContent className="p-6">
                          <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                            <service.icon className="w-7 h-7 text-secondary" />
                          </div>
                          <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                            {service.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {service.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* Why Choose Us */}
          <SectionReveal direction="left">
            <section className="py-16 md:py-24 bg-muted/50">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                      Why Choose Us
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                      Best Packers and Movers in {location.city}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Panya Global Movers has been serving {location.city} and {location.state} for over 15 years. 
                      We understand the local logistics, traffic patterns, and building regulations to ensure 
                      a smooth and hassle-free moving experience.
                    </p>
                    <div className="space-y-4">
                      {whyChooseUs.map((item) => (
                        <div key={item.title} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <item.icon className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-heading font-semibold text-foreground">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                          <Truck className="w-12 h-12 text-secondary" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                          Serving {location.city}
                        </h3>
                        <p className="text-muted-foreground">
                          Professional relocation services across all areas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* Areas We Serve */}
          <SectionReveal direction="up">
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                    Coverage Area
                  </span>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Areas We Serve in {location.city}
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {location.areas.map((area) => (
                    <span
                      key={area}
                      className="px-4 py-2 bg-muted rounded-full text-foreground text-sm hover:bg-secondary/10 transition-colors"
                    >
                      <MapPin className="w-4 h-4 inline mr-1 text-secondary" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <SectionReveal direction="right">
              <section className="py-16 md:py-24 bg-muted/50">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                      Customer Reviews
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                      What Our Customers Say
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                      <Card key={testimonial.id} className="h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "text-secondary fill-secondary"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-foreground mb-4 line-clamp-4">
                            "{testimonial.content}"
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                              <span className="font-bold text-secondary">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-heading font-semibold text-foreground">
                                {testimonial.name}
                              </div>
                              {testimonial.location && (
                                <div className="text-xs text-muted-foreground">
                                  {testimonial.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            </SectionReveal>
          )}

          {/* Location-Specific FAQ */}
          <SectionReveal direction="up">
            <LocationFAQ 
              city={location.city} 
              state={location.state} 
              phoneNumber={location.phoneNumber} 
            />
          </SectionReveal>

          {/* CTA Section */}
          <SectionReveal direction="fade">
            <section className="py-16 md:py-24 bg-primary text-primary-foreground">
              <div className="container mx-auto px-4 text-center">
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                  Ready to Move in {location.city}?
                </h2>
                <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                  Get a free quote today and experience hassle-free relocation with Panya Global Movers.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/quote">Get Free Quote</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <a href={`tel:${location.phoneNumber}`}>
                      <Phone className="mr-2 w-5 h-5" /> Call Now
                    </a>
                  </Button>
                </div>
              </div>
            </section>
          </SectionReveal>

          {/* Nearby Locations */}
          {location.nearbyLocations.length > 0 && (
            <SectionReveal direction="up">
              <section className="py-12 border-t border-border">
                <div className="container mx-auto px-4">
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-6 text-center">
                    Packers and Movers in Nearby Cities
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {location.nearbyLocations.map((nearby) => (
                      <Link
                        key={nearby.slug}
                        to={`/packers-movers/${nearby.slug}`}
                        className="px-4 py-2 bg-muted rounded-full text-foreground text-sm hover:bg-secondary/10 hover:text-secondary transition-colors"
                      >
                        Packers and Movers in {nearby.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </SectionReveal>
          )}
        </main>
        <CityWiseLinks />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default LocationTemplate;
