import { Link } from "react-router-dom";
import { 
  ShieldCheck, MapPin, Truck, Building2, Globe2, 
  HelpCircle, Phone, Mail, Award, Users, RefreshCw, Star 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HomeSEOContent = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* =====================================================
            SECTION 1: HERO DESCRIPTION + STATS BAR
            ===================================================== */}
        <div id="seo-hero" className="max-w-5xl mx-auto mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm font-semibold mb-6">
            <Award className="w-4 h-4" />
            India's Leading Relocation Brand
          </div>
          
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-8 leading-tight">
            Seamless Shifting Solutions Across{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              India & Globally
            </span>
          </h2>

          {/* Crawlable Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10 p-6 bg-background/50 border border-border/80 backdrop-blur-md rounded-2xl shadow-lg">
            <div className="text-center p-3 border-r border-border/50 last:border-none">
              <span className="block text-2xl md:text-3xl font-bold text-secondary mb-1">16+ Years</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">Experience</span>
            </div>
            <div className="text-center p-3 md:border-r border-border/50">
              <span className="block text-2xl md:text-3xl font-bold text-secondary mb-1">9,600+</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">Happy Clients</span>
            </div>
            <div className="text-center p-3 border-r border-border/50 last:border-none">
              <span className="block text-2xl md:text-3xl font-bold text-secondary mb-1">280+</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">Cities Covered</span>
            </div>
            <div className="text-center p-3">
              <span className="block text-2xl md:text-3xl font-bold text-secondary mb-1">24/7</span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">Customer Support</span>
            </div>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl mx-auto">
            Panya Global Relocation Pvt. Ltd. is one of India's most trusted packers
            and movers companies serving Delhi, Gurgaon, Noida, and 280+ cities across
            India and globally. With 16+ years of experience and 9,600+ successful
            relocations, we deliver household shifting, corporate relocation,
            international moving, and vehicle transport - all with a zero-damage
            commitment and 24/7 support.
          </p>
        </div>

        {/* =====================================================
            SECTION 2: SERVICES LISTING
            ===================================================== */}
        <div id="seo-services" className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Our Professional Relocation Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Customized, premium shifting solutions managed by relocation specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Service 1 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <Globe2 className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Household and Residential Shifting
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Safe, careful packing and moving of your home goods across
                  Delhi NCR and 280+ cities Pan-India.
                </p>
              </CardContent>
            </Card>

            {/* Service 2 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <Building2 className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Corporate and Office Relocation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  End-to-end office shifting with dedicated coordinator,
                  IT asset handling, and minimal business downtime.
                </p>
              </CardContent>
            </Card>

            {/* Service 3 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <Globe2 className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  International Packing and Moving
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Door-to-door international relocation from India to
                  worldwide destinations with full customs support.
                </p>
              </CardContent>
            </Card>

            {/* Service 4 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <Truck className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Car and Vehicle Transport
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  GPS-tracked, enclosed carrier transport for cars and
                  two-wheelers across India.
                </p>
              </CardContent>
            </Card>

            {/* Service 5 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <ShieldCheck className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Storage and Warehousing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure short-term and long-term storage facilities
                  across Delhi NCR.
                </p>
              </CardContent>
            </Card>

            {/* Service 6 */}
            <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 border border-border/60 bg-background/60 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                  <RefreshCw className="w-6 h-6 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                  Workspace Setup and Shifting
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete workspace relocation including furniture,
                  fixtures, and equipment reinstallation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* =====================================================
            SECTION 3: WHY PANYA GLOBAL
            ===================================================== */}
        <div id="seo-why" className="max-w-5xl mx-auto mb-24 p-8 md:p-12 bg-background/40 border border-border/80 backdrop-blur-md rounded-3xl shadow-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose Panya Global Over Other Packers and Movers
            </h2>
            <p className="text-muted-foreground">
              What sets us apart from conventional moving services.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0">
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <strong className="block text-foreground text-lg mb-1">Dedicated corporate relocation team.</strong>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Unlike large movers who treat every job the same, Panya Global assigns
                  a dedicated relocation coordinator for every corporate and office move -
                  from planning to final setup at the new location.
                </span>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Globe2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <strong className="block text-foreground text-lg mb-1">International door-to-door service.</strong>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  We handle full customs documentation, overseas freight, and delivery
                  coordination across 280+ global destinations - so you never deal
                  with multiple vendors.
                </span>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <strong className="block text-foreground text-lg mb-1">GPS-tracked transportation.</strong>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Every shipment - local or long-distance - is tracked in real time.
                  You get live updates, not just a delivery window.
                </span>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <strong className="block text-foreground text-lg mb-1">16 years of verified trust.</strong>
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Over 9,600 families and businesses have relied on Panya Global since
                  2008. Our client retention rate reflects what no advertisement
                  can manufacture.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* =====================================================
            SECTION 4: CITIES (INTERNAL LINKS)
            ===================================================== */}
        <div id="seo-cities" className="max-w-4xl mx-auto mb-20 p-8 bg-muted/40 border border-border/50 rounded-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
            Packers and Movers Across Delhi NCR and Beyond
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Panya Global provides professional packing and moving services across all
            major Delhi NCR locations including South Delhi, North Delhi, Dwarka,
            Rohini, Gurgaon, Gurugram, Noida, Greater Noida, Faridabad, and
            Ghaziabad. We also cover 280+ cities Pan-India including Mumbai,
            Bangalore, Hyderabad, Chennai, Pune, Kolkata, and Ahmedabad.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <Link to="/packers-movers-delhi" className="text-secondary hover:text-accent hover:underline px-3 py-1 bg-background rounded-full border border-border transition-colors">
              Packers Movers Delhi
            </Link>
            <Link to="/packers-movers-gurgaon" className="text-secondary hover:text-accent hover:underline px-3 py-1 bg-background rounded-full border border-border transition-colors">
              Packers Movers Gurgaon
            </Link>
            <Link to="/packers-movers-noida" className="text-secondary hover:text-accent hover:underline px-3 py-1 bg-background rounded-full border border-border transition-colors">
              Packers Movers Noida
            </Link>
            <Link to="/international-packers-movers-delhi" className="text-secondary hover:text-accent hover:underline px-3 py-1 bg-background rounded-full border border-border transition-colors">
              International Movers Delhi
            </Link>
          </div>
        </div>

        {/* =====================================================
            SECTION 5: INTERNATIONAL + NRI
            ===================================================== */}
        <div id="seo-international" className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                International Relocation and NRI Moving Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Panya Global handles international relocations from India to worldwide
                destinations. For moves originating in Delhi and across India, our own
                team manages the full process - packing, documentation, customs clearance,
                and delivery coordination. For inbound moves and NRI returns from abroad,
                we work with a trusted network of global relocation partners to ensure
                seamless door-to-door service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are moving from Delhi to Dubai, relocating your family from
                India to the USA or UK, or returning to India from the Gulf - Panya Global
                coordinates every step. Call <a href="tel:+911141556447" className="text-secondary hover:underline font-bold">+91-11-41556447</a> for a free international
                relocation consultation.
              </p>
            </div>
            <div className="md:col-span-4 bg-background/50 border border-border/80 p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
              <Globe2 className="w-16 h-16 text-secondary mb-4" />
              <h4 className="font-heading font-bold text-lg text-foreground mb-2">Global Network</h4>
              <p className="text-xs text-muted-foreground">
                Connecting India with UAE, USA, UK, Canada, Singapore, Australia and 280+ international destinations.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            SECTION 6: CTA SECTION
            ===================================================== */}
        <div id="seo-cta" className="max-w-4xl mx-auto text-center p-8 md:p-12 bg-primary text-primary-foreground rounded-3xl relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-heading font-bold mb-4">
              Get a Free Relocation Quote Today
            </h2>
            <p className="text-primary-foreground/85 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Planning to shift? Get a free, no-obligation quote from Panya Global's
              relocation experts. We serve Delhi, Gurgaon, Noida, and 280+ cities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="shadow-lg shadow-secondary/20">
                <Link to="/quote">
                  Request Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <a href="tel:+911141556447">
                  <Phone className="w-4 h-4 mr-2" />
                  +91-11-41556447
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <a href="mailto:info@panyaglobal.in">
                  <Mail className="w-4 h-4 mr-2" />
                  info@panyaglobal.in
                </a>
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/75 mt-6 font-medium">
              * Our expert relocation response team responds within 2 hours.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeSEOContent;
