import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Recycle, 
  Truck, 
  FileText, 
  Shield, 
  Leaf, 
  Phone, 
  Mail,
  CheckCircle,
  Building2,
  Monitor,
  Package,
  FileStack,
  Cpu,
  ClipboardCheck,
  IndianRupee,
  Calendar,
  Award
} from "lucide-react";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import EasyCoverBanner from "@/components/services/EasyCoverBanner";
import PageTransition from "@/components/layout/PageTransition";
import SectionReveal from "@/components/layout/SectionReveal";
import heroImage from "@/assets/services/hero-scrap.webp";

const ScrapService = () => {
  const scrapCategories = [
    {
      icon: Building2,
      title: "Old Office Furniture",
      description: "Workstations, chairs, cabinets, storage units"
    },
    {
      icon: Monitor,
      title: "E-Waste & IT Assets",
      description: "Computers, laptops, printers, servers, monitors"
    },
    {
      icon: Package,
      title: "Scrap Metal & Equipment",
      description: "Iron, steel, aluminum, machinery scrap"
    },
    {
      icon: FileStack,
      title: "Paper & Cardboard Waste",
      description: "Office paper, cartons, packaging material"
    },
    {
      icon: Cpu,
      title: "Electronic Components",
      description: "Circuit boards, wiring, electronic assemblies"
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Contact Us for Scrap Evaluation",
      description: "Share scrap type, quantity, and location"
    },
    {
      step: "2",
      title: "Free On-Site Assessment",
      description: "Physical verification by our team"
    },
    {
      step: "3",
      title: "Instant Quotation",
      description: "Market-linked pricing shared transparently"
    },
    {
      step: "4",
      title: "Scheduled Scrap Pickup",
      description: "Pickup at your preferred date & time"
    },
    {
      step: "5",
      title: "Payment on the Spot",
      description: "Immediate settlement after pickup"
    },
    {
      step: "6",
      title: "Disposal Certificate Issued",
      description: "Proof of responsible recycling & compliance"
    }
  ];

  const benefits = [
    {
      icon: IndianRupee,
      title: "Fair Market Pricing",
      description: "Transparent valuation based on current scrap rates"
    },
    {
      icon: Truck,
      title: "Free Scrap Pickup Service",
      description: "No logistics cost for corporate clients"
    },
    {
      icon: Recycle,
      title: "Authorized Recycling & Disposal",
      description: "Environmentally safe processing"
    },
    {
      icon: FileText,
      title: "Compliance Documentation",
      description: "Invoices, disposal records, audit support"
    },
    {
      icon: Leaf,
      title: "Eco-Friendly Waste Management",
      description: "Supports corporate ESG & sustainability goals"
    }
  ];

  const idealFor = [
    "Corporate offices",
    "IT companies",
    "Warehouses & factories",
    "Co-working spaces",
    "Commercial buildings",
    "Institutions & enterprises"
  ];

  const fields = [
    {
      id: "name",
      label: "Contact Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter your full name"
    },
    {
      id: "email",
      label: "Email Address",
      type: "email" as const,
      required: true,
      placeholder: "your@email.com"
    },
    {
      id: "phone",
      label: "Phone Number",
      type: "tel" as const,
      required: true,
      placeholder: "+91 XXXXX XXXXX"
    },
    {
      id: "scrapType",
      label: "Type of Scrap",
      type: "select" as const,
      required: true,
      options: [
        { value: "office-furniture", label: "Office Furniture" },
        { value: "e-waste", label: "E-Waste & IT Assets" },
        { value: "scrap-metal", label: "Scrap Metal & Equipment" },
        { value: "paper-cardboard", label: "Paper & Cardboard" },
        { value: "electronics", label: "Electronic Components" },
        { value: "mixed", label: "Mixed Scrap" },
        { value: "other", label: "Other" }
      ]
    },
    {
      id: "estimatedQuantity",
      label: "Estimated Quantity",
      type: "select" as const,
      required: true,
      options: [
        { value: "less-100kg", label: "Less than 100 kg" },
        { value: "100-500kg", label: "100 - 500 kg" },
        { value: "500kg-1ton", label: "500 kg - 1 ton" },
        { value: "1-5tons", label: "1 - 5 tons" },
        { value: "more-5tons", label: "More than 5 tons" }
      ]
    },
    {
      id: "pickupLocation",
      label: "Pickup Location (City)",
      type: "text" as const,
      required: true,
      placeholder: "Enter city name"
    },
    {
      id: "preferredDate",
      label: "Preferred Pickup Date",
      type: "date" as const,
      required: false
    },
    {
      id: "additionalInfo",
      label: "Additional Details",
      type: "textarea" as const,
      required: false,
      placeholder: "Describe the scrap items, condition, or any special requirements..."
    }
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>Corporate Scrap Selling & Waste Management | Panya Global</title>
        <meta 
          name="description" 
          content="Compliant corporate scrap disposal services. Fair valuation, free pickup, eco-friendly recycling. E-waste, furniture, metal scrap buying with proper documentation." 
        />
        <meta name="keywords" content="corporate scrap buyer, e-waste disposal, office furniture scrap, scrap pickup service, eco-friendly disposal, compliance documentation" />
        <link rel="canonical" href="https://panyaglobal.in/services/scrap-service" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        <div className="container mx-auto px-4 relative z-10">
          <SectionReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Recycle className="h-5 w-5" />
                <span className="text-sm font-medium">Workplace Relocation Services</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Corporate Scrap Selling & Waste Management
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Compliant, Transparent & Eco-Friendly Scrap Disposal for Businesses
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <a href="tel:+918800446447">
                    <Phone className="h-5 w-5" />
                    Call: +91 8800 446 447
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <a href="mailto:info@panyaglobal.in">
                    <Mail className="h-5 w-5" />
                    info@panyaglobal.in
                  </a>
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <EasyCoverBanner />

      {/* Introduction */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Panya Global Relocation Pvt. Ltd. offers corporate scrap selling and waste management solutions designed for offices, enterprises, and institutions looking to dispose of scrap responsibly, legally, and profitably.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                We help organizations liquidate scrap assets, manage waste streams, and meet environmental compliance—without operational hassle.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Corporate Scrap & Waste Management Solutions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Improper scrap disposal is a compliance risk, not just a housekeeping issue.
              </p>
            </div>
          </SectionReveal>
          
          <SectionReveal delay={0.1}>
            <Card className="max-w-3xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                  Our corporate scrap services ensure:
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Legal disposal",
                    "Complete documentation",
                    "Fair valuation",
                    "Environmentally responsible recycling"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-6 text-center">
                  We work with authorized recyclers and follow industry-standard waste handling practices.
                </p>
              </CardContent>
            </Card>
          </SectionReveal>
        </div>
      </section>

      {/* Scrap Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Corporate Scrap Do We Buy?
              </h2>
              <p className="text-lg text-muted-foreground">
                We handle bulk and recurring scrap from offices, warehouses, and commercial facilities.
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {scrapCategories.map((category, index) => (
              <SectionReveal key={index} delay={index * 0.1}>
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Companies Choose Our Scrap Service
              </h2>
              <p className="text-lg text-muted-foreground">
                This isn't about selling junk. It's about risk-free disposal and audit-ready records.
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <SectionReveal key={index} delay={index * 0.1}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How Our Corporate Scrap Disposal Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple. Controlled. Documented.
              </p>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <SectionReveal key={index} delay={index * 0.1}>
                <Card className="h-full border-border/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {step.step}
                  </div>
                  <CardContent className="p-6 pt-16">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ideal For
              </h2>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {idealFor.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 bg-background border border-border rounded-full px-5 py-2.5 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Book Corporate Scrap Pickup
              </h2>
              <p className="text-lg text-muted-foreground">
                Looking for a trusted corporate scrap buyer with proper documentation and ethical disposal?
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="max-w-2xl mx-auto">
              <ServiceInquiryForm 
                serviceName="Scrap Service"
                serviceType="workplace"
                fields={fields}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <SectionReveal>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Eco-Friendly • Compliant • Fair Pricing</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sell Scrap Responsibly. Stay Compliant. Get Paid Fairly.
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <a href="tel:+918800446447">
                    <Phone className="h-5 w-5" />
                    Scrap Hotline: +91 8800 446 447
                  </a>
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <CityWiseLinks />
      <Footer />
    </PageTransition>
  );
};

export default ScrapService;
