import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import PageTransition from "@/components/layout/PageTransition";
import SectionReveal from "@/components/layout/SectionReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Shield, Clock, Users, Star, Award, CheckCircle2 } from "lucide-react";

const PackersMoversDelhi = () => {
  const delhiSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Panya Global Relocation - Delhi",
    "url": "https://www.panyaglobal.in/packers-movers-delhi",
    "telephone": "+911141556447",
    "description": "Expert packers and movers in Delhi offering household, corporate and international relocation with 16+ years experience.",
    "areaServed": {"@type": "City", "name": "Delhi"},
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Delhi",
      "addressRegion": "Delhi NCR",
      "addressCountry": "IN"
    }
  };

  const areas = [
    "South Delhi", "North Delhi", "East Delhi", "West Delhi", 
    "Central Delhi", "Dwarka", "Rohini", "Lajpat Nagar", 
    "Karol Bagh", "Vasant Kunj", "Saket", "Pitampura", 
    "Janakpuri", "Connaught Place", "Mayur Vihar"
  ];

  return (
    <PageTransition>
      <SEO 
        title="Delhi Packers and Movers | Panya Global Relocation"
        description="Best packers and movers in Delhi. Panya Global offers household, office and international relocation in Delhi. 16+ years experience. Free quote: +91-11-41556447."
        schema={delhiSchema}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full" />
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-xs font-semibold mb-4">
                <MapPin className="w-3.5 h-3.5" />
                Capital Region Moving Experts
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Packers and Movers in Delhi | Panya Global
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Panya Global Relocation Pvt. Ltd. is one of the premier packers and movers companies serving Delhi since 2008. 
                Our professional team handles household shifting, corporate moves, and vehicle relocation with a zero-damage guarantee.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/quote">Get Free Quote</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <a href="tel:+911141556447">
                    <Phone className="w-4 h-4 mr-2" /> Call Now
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Intro & Core Services */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-10">
                Our Services in Delhi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Household Shifting in Delhi</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Moving homes in Delhi can be challenging due to narrow streets and busy residential hubs. 
                      Our specialized packers use multi-layer packaging to secure your furniture, electronics, and fragile items.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Office Relocation in Delhi</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      We offer commercial office shifting across major business districts like Connaught Place and Nehru Place. 
                      With systematic label tagging and secure IT asset relocation, we minimize your business downtime.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Car Transport in Delhi</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Transport your vehicles securely. We use specialized car carriers and enclosed trailers 
                      equipped with real-time tracking to ensure your vehicle arrives safely at the destination.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Why Choose Us */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-8">
                  Why Panya Global is the Best Mover in Delhi
                </h2>
                <p className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-8">
                  Relocating in Delhi requires local expertise, specialized routing knowledge, and compliance with municipal regulations. 
                  Panya Global offers end-to-end relocation solutions with transparent, competitive pricing and dedicated coordinators. 
                  With 16+ years of proven record, we ensure your household belongings are transported securely without stress.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">9,600+</span>
                    <span className="text-xs text-muted-foreground">Relocations Done</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">100%</span>
                    <span className="text-xs text-muted-foreground">Safe Delivery Record</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">16+ Years</span>
                    <span className="text-xs text-muted-foreground">Industry Presence</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">24/7</span>
                    <span className="text-xs text-muted-foreground">Customer Support</span>
                  </div>
                </div>
              </div>

              {/* Areas Covered */}
              <div className="mb-16 bg-muted/30 p-8 rounded-2xl border border-border/50">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-6">
                  Areas We Cover in Delhi
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                  We provide door-to-door relocation across all major colonies and micro-markets of Delhi.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {areas.map((area) => (
                    <span key={area} className="px-4 py-2 bg-background border border-border/60 rounded-full text-xs font-medium text-foreground hover:bg-secondary/10 hover:text-secondary transition-colors">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Local CTA */}
              <div className="text-center p-8 bg-primary text-primary-foreground rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-3">Get Free Quote in Delhi</h2>
                  <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
                    Looking to shift your home or office in Delhi? Get in touch with our experts today.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild variant="secondary">
                      <Link to="/quote">Request Quote</Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                      <a href="tel:+911141556447">
                        <Phone className="w-4 h-4 mr-2" /> +91-11-41556447
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>

        <CityWiseLinks />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default PackersMoversDelhi;
