import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import PageTransition from "@/components/layout/PageTransition";
import SectionReveal from "@/components/layout/SectionReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, Phone, Mail, Shield, Clock, Users, Star, Award, CheckCircle2 } from "lucide-react";

const InternationalMoversDelhi = () => {
  const internationalSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": "Panya Global Relocation - International Moving Delhi",
    "url": "https://www.panyaglobal.in/international-packers-movers-delhi",
    "telephone": "+911141556447",
    "description": "Expert international packers and movers in Delhi offering door-to-door overseas relocation with full customs clearance and shipping support.",
    "areaServed": {"@type": "City", "name": "Delhi"},
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Delhi",
      "addressRegion": "Delhi NCR",
      "addressCountry": "IN"
    }
  };

  return (
    <PageTransition>
      <SEO 
        title="International Packers and Movers Delhi | Panya Global"
        description="Best international packers and movers in Delhi. Panya Global offers door-to-door relocation, customs clearance, and global shipping. Call +91-11-41556447."
        schema={internationalSchema}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full" />
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-xs font-semibold mb-4">
                <Globe2 className="w-3.5 h-3.5" />
                Global Relocation Experts
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                International Packers and Movers in Delhi
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Panya Global Relocation Pvt. Ltd. is your trusted partner for door-to-door international moving from Delhi and India to global destinations. 
                We manage packing, freight, custom documentations, and port clearance under a single unified coordination team.
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

          {/* Core Content */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-10">
                Our Overseas Shifting Services
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Outbound International Relocation</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      For moves originating in Delhi and across India, our trained packers handle high-quality export packing, 
                      loading, and prepare full customs inventory documentation to ensure smooth clearance at destination.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Inbound NRI Relocation</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      For families returning to India from the Gulf, USA, UK, or Europe, we manage custom clearances, 
                      import rules handling, transport, unpacking, and storage setups to make your return transition stress-free.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-3">Customs Clearance Support</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      Customs regulations can be complex. We assist you in collecting and preparing correct import/export documents, 
                      managing customs declarations, duties, and clearances efficiently.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Why Choose Us */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground text-center mb-8">
                  Why Panya Global is the Best International Mover in Delhi
                </h2>
                <p className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed mb-8">
                  Unlike conventional packers, international relocation requires complex ocean/air freight booking, cargo consolidation, and network handling. 
                  Panya Global works with a verified network of global relocation partners across 280+ cities to ensure seamless door-to-door delivery. 
                  Our coordinators manage all aspects of your move, providing clear tracking, responsive updates, and full cargo insurance. 
                  Whether you are moving to Dubai, London, New York, or Singapore, we commit to zero-damage shifting.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">280+</span>
                    <span className="text-xs text-muted-foreground">Global Destinations</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">100%</span>
                    <span className="text-xs text-muted-foreground">Customs Compliance</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">16+ Years</span>
                    <span className="text-xs text-muted-foreground">Relocation Expertise</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-secondary">24/7</span>
                    <span className="text-xs text-muted-foreground">Coordinator Support</span>
                  </div>
                </div>
              </div>

              {/* Local CTA */}
              <div className="text-center p-8 bg-primary text-primary-foreground rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-heading font-bold mb-3">Get a Free International Relocation Quote</h2>
                  <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
                    Relocating overseas? Talk to our international moving experts for a free consultation.
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

export default InternationalMoversDelhi;
