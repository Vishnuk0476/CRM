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

const PackersMoversGurgaon = () => {
  const gurgaonSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Panya Global Relocation - Gurgaon",
    "url": "https://www.panyaglobal.in/packers-movers-gurgaon",
    "telephone": "+911141556447",
    "description": "Premium packers and movers in Gurgaon offering office shifting, home moves and vehicle transport services with 16+ years experience.",
    "areaServed": {"@type": "City", "name": "Gurgaon"},
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Gurgaon",
      "addressRegion": "Haryana",
      "addressCountry": "IN"
    }
  };

  const areas = [
    "Sectors 1-115", "DLF Phases 1-5", "Sohna Road", "Golf Course Road", 
    "Golf Course Extension", "Cyber City", "Udyog Vihar", "Manesar", 
    "South City 1 & 2", "Nirvana Country", "Sushant Lok 1-3", "Palam Vihar"
  ];

  return (
    <PageTransition>
      <SEO 
        title="Gurgaon Packers and Movers | Panya Global Relocation"
        description="Best packers and movers in Gurgaon. Panya Global offers household, office and international relocation in Gurgaon. 16+ years experience. Free quote: +91-11-41556447."
        schema={gurgaonSchema}
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
                Millennial City Shifting Experts
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Packers and Movers in Gurgaon | Panya Global
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Panya Global Relocation Pvt. Ltd. provides top-tier corporate, household, and vehicle shifting solutions in Gurgaon and Gurugram since 2008. 
                Our experienced staff is trained in professional packing and handling techniques to ensure complete goods protection.
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
                Our Services in Gurgaon
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Household Shifting in Gurgaon</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Whether you are relocating to a high-rise apartment on Sohna Road or a villa in DLF Phase 5, 
                      our teams are equipped to handle high-rise goods handling, large furniture packing, and loading safely.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Office Relocation in Gurgaon</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Gurgaon is the hub of MNCs. We specialize in corporate shifting across Cyber City and Udyog Vihar. 
                      Our dedicated move coordinators plan the shifting strategy to ensure your operations resume with zero lag.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Car Transport in Gurgaon</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      We offer premium car and two-wheeler carrier services. Your vehicle is transported in secure, 
                      enclosed trailers with GPS tracking so you can monitor transit details in real-time.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Why Choose Us */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-8">
                  Why Panya Global is the Best Mover in Gurgaon
                </h2>
                <p className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-8">
                  Relocating corporate personnel and luxury households in Gurgaon demands high standards of service. 
                  Panya Global offers premium packing materials, modern transport fleets, and licensed crews. 
                  We manage customs handling and storage services natively, allowing a completely hassle-free moving experience. 
                  With 16+ years of expertise and 9,600+ satisfied clients, we are the most reliable shifting partners in Haryana.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">9,600+</span>
                    <span className="text-xs text-muted-foreground">Successful Moves</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">GPS</span>
                    <span className="text-xs text-muted-foreground">Real-time Tracking</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">16+ Years</span>
                    <span className="text-xs text-muted-foreground">Industry Experience</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">100%</span>
                    <span className="text-xs text-muted-foreground">No Hidden Costs</span>
                  </div>
                </div>
              </div>

              {/* Areas Covered */}
              <div className="mb-16 bg-muted/30 p-8 rounded-2xl border border-border/50">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-6">
                  Areas We Cover in Gurgaon
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                  We provide doorstep relocation services across all key sectors and major colonies of Gurgaon.
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
                  <h2 className="text-2xl font-heading font-bold mb-3">Get Free Quote in Gurgaon</h2>
                  <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
                    Planning a household or office move in Gurgaon? Talk to our shifting specialists today.
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

export default PackersMoversGurgaon;
