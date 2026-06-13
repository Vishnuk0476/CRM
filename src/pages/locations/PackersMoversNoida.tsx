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

const PackersMoversNoida = () => {
  const noidaSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Panya Global Relocation - Noida",
    "url": "https://www.panyaglobal.in/packers-movers-noida",
    "telephone": "+911141556447",
    "description": "Professional packers and movers in Noida offering residential shifting, IT park relocations and vehicle transport with 16+ years experience.",
    "areaServed": {"@type": "City", "name": "Noida"},
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Noida",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN"
    }
  };

  const areas = [
    "Sectors 1-168", "Greater Noida", "Noida Extension", "Sector 62", 
    "Sector 18", "Sector 50", "Sector 137", "Sector 15", 
    "Sector 76", "Sector 78", "Sector 110", "Sector 150"
  ];

  return (
    <PageTransition>
      <SEO 
        title="Noida Packers and Movers | Panya Global Relocation"
        description="Best packers and movers in Noida. Panya Global offers household, office and international relocation in Noida. 16+ years experience. Free quote: +91-11-41556447."
        schema={noidaSchema}
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
                Planned City Shifting Experts
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Packers and Movers in Noida | Panya Global
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Panya Global Relocation Pvt. Ltd. is your trusted partner for premium packing and moving services in Noida since 2008. 
                We specialize in secure residential moving, IT park setups, and vehicle carrier shipping.
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
                Our Services in Noida
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Household Shifting in Noida</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      We offer safe home shifting across Noida sectors, Noida Extension, and Greater Noida. 
                      Our crews use clean carton boxes, bubble wraps, and foam sheets to protect all household items during transit.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Office Relocation in Noida</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Relocating corporate spaces in Noida's IT hubs (like Sector 62, Sector 125, and Special Economic Zones) 
                      is executed with professional planning, computer servers packing, and systematic layout organization.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Car Transport in Noida</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Transport your vehicle securely outside Uttar Pradesh. We use high-quality car carriers, 
                      providing safe straps, insurance checks, and door-to-door transit for cars and bikes.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Why Choose Us */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-8">
                  Why Panya Global is the Best Mover in Noida
                </h2>
                <p className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-8">
                  Moving within Noida or from Noida to other cities requires an understanding of local customs, toll structures, and secure roads. 
                  Panya Global Relocation provides transparent estimates, zero hidden fees, and absolute safety of your household belongings. 
                  Our team uses premium packaging and modern trucks to handle goods across sectors securely. 
                  With 16+ years of verified industry experience and 9,600+ happy clients, we guarantee high reliability.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">9,600+</span>
                    <span className="text-xs text-muted-foreground">Successful Moves</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">100%</span>
                    <span className="text-xs text-muted-foreground">Insured Shifting</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">16+ Years</span>
                    <span className="text-xs text-muted-foreground">Local Expertise</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">24/7</span>
                    <span className="text-xs text-muted-foreground">Support Hotline</span>
                  </div>
                </div>
              </div>

              {/* Areas Covered */}
              <div className="mb-16 bg-muted/30 p-8 rounded-2xl border border-border/50">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-6">
                  Areas We Cover in Noida
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                  We cover all commercial sectors, industrial phases, and residential communities of Noida.
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
                  <h2 className="text-2xl font-heading font-bold mb-3">Get Free Quote in Noida</h2>
                  <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
                    Request a free shifting survey and quote from Noida's trusted relocation team.
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

export default PackersMoversNoida;
