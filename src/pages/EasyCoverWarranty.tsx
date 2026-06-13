import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, Package, Truck, PackageOpen, AlertTriangle, CheckCircle, XCircle,
  Phone, Mail, FileText, Users, Building2, Sofa, Monitor, Wine, Briefcase,
  ClipboardCheck, ShieldCheck, Clock, Heart, ArrowRight, Zap
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { Button } from "@/components/ui/button";
import SectionReveal from "@/components/layout/SectionReveal";

// Images
import heroComparison from "@/assets/warranty/hero-comparison.webp";
import consultation from "@/assets/warranty/consultation.webp";
import familyCorporate from "@/assets/warranty/family-corporate.webp";

const coverageItems = [
  { icon: Package, text: "Damage during packing" },
  { icon: Truck, text: "Damage during transportation" },
  { icon: PackageOpen, text: "Damage during unloading" },
  { icon: AlertTriangle, text: "Loss due to mishandling" },
  { icon: Wine, text: "Accidental breakage under covered conditions" },
];

const appliesToItems = [
  { icon: Sofa, text: "Furniture" },
  { icon: Monitor, text: "Electronics" },
  { icon: Wine, text: "Fragile household items" },
  { icon: Briefcase, text: "Office equipment" },
];

const differentiators = [
  { 
    icon: FileText, 
    title: "Simple Valuation Process", 
    description: "Clear declared value — no inflated or confusing assessments" 
  },
  { 
    icon: Users, 
    title: "No Third-Party Confusion", 
    description: "One company. One responsibility." 
  },
  { 
    icon: Zap, 
    title: "Fast Claim Resolution", 
    description: "No endless follow-ups or excuses" 
  },
  { 
    icon: ShieldCheck, 
    title: "Transparent Terms", 
    description: "What's covered is clearly communicated before the move" 
  },
  { 
    icon: Heart, 
    title: "Customer-First Approach", 
    description: "We don't disappear after delivery" 
  },
];

const processSteps = [
  { step: 1, title: "Declare Value Before the Move", description: "We help you assess the value of your goods honestly" },
  { step: 2, title: "Choose Easy Cover Warranty", description: "Protection added before packing begins" },
  { step: 3, title: "Safe Packing & Transportation", description: "Handled by trained professionals" },
  { step: 4, title: "Delivery & Inspection", description: "Items checked upon delivery" },
  { step: 5, title: "Claim (If Required)", description: "Quick documentation and resolution process" },
];

const exclusions = [
  "Damage due to incorrect value declaration",
  "Pre-existing damages not reported",
  "Prohibited or hazardous items",
];

const whoShouldOpt = [
  "You're moving fragile or high-value items",
  "You don't want post-move stress",
  "You value accountability over cheap quotes",
  "You expect professional handling",
];

const promises = [
  "Clear terms",
  "Honest valuation",
  "Professional handling",
  "Faster resolution",
  "No blame-shifting",
];

const EasyCoverWarranty = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 relative overflow-hidden min-h-[700px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">Protection Plan</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                  Easy Cover <span className="text-secondary">Warranty</span>
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-medium">
                  Simple. Transparent. Hassle-Free Protection for Your Move.
                </p>
                <p className="text-primary-foreground/70 mb-8 text-lg leading-relaxed">
                  Relocation always involves risk. Broken items, transit damage, unexpected loss — pretending otherwise is dishonest. Easy Cover Warranty is designed to protect your belongings without complicated paperwork, hidden clauses, or post-move arguments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/quote">
                    <Button size="lg" variant="hero" className="gap-2">
                      Get Protected Quote
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="tel:+918800446447">
                    <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      <Phone className="w-5 h-5" />
                      Call 8800446447
                    </Button>
                  </a>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <img 
                  src={heroComparison} 
                  alt="Damaged vs Protected comparison" 
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">No Fine-Print Drama</p>
                      <p className="text-sm text-muted-foreground">Clear coverage & accountability</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What Is Easy Cover */}
        <SectionReveal direction="up">
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                  What Is Easy Cover Warranty?
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Protection That <span className="text-secondary">Actually Works</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Easy Cover Warranty is a simplified protection plan that safeguards your household or office goods during packing, transportation, and delivery. It ensures that if something goes wrong, you're not left negotiating or chasing multiple parties.
                </p>
                <div className="bg-secondary/10 rounded-2xl p-8 border border-secondary/20">
                  <p className="text-2xl font-bold text-foreground">
                    We take responsibility — <span className="text-secondary">end of story.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Coverage Section */}
        <SectionReveal direction="up">
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                  Comprehensive Coverage
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What Does Easy Cover <span className="text-secondary">Cover?</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  This is not vague coverage. It's clearly defined.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Coverage Includes */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 border border-border"
                >
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <CheckCircle className="w-7 h-7 text-secondary" />
                    Coverage Includes
                  </h3>
                  <div className="space-y-4">
                    {coverageItems.map((item, index) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary/5 border border-secondary/10"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-foreground font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Applies To */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-8 border border-border"
                >
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Package className="w-7 h-7 text-secondary" />
                    Coverage Applies To
                  </h3>
                  <div className="space-y-4">
                    {appliesToItems.map((item, index) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary/5 border border-secondary/10"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="text-foreground font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* What Makes It Different */}
        <SectionReveal direction="up">
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                    Our Difference
                  </span>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                    What Makes Easy Cover <span className="text-secondary">Different?</span>
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    Let's be blunt: Most "insurance" is designed to reject claims, not settle them. We're different.
                  </p>
                  
                  <div className="space-y-4">
                    {differentiators.map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <img 
                    src={consultation} 
                    alt="Professional consultation" 
                    className="rounded-2xl shadow-xl w-full"
                  loading="lazy" decoding="async" />
                </motion.div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* How It Works */}
        <SectionReveal direction="up">
          <section className="py-20 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-4">
                  Simple Process
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  How Easy Cover Warranty <span className="text-secondary">Works</span>
                </h2>
                <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
                  No paperwork circus. No legal maze. Just simple steps.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-secondary/30 hidden md:block" />
                  
                  {processSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      viewport={{ once: true }}
                      className="relative flex items-start gap-6 mb-8 last:mb-0"
                    >
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 z-10">
                        <span className="text-2xl font-bold text-secondary-foreground">{step.step}</span>
                      </div>
                      <div className="flex-1 bg-primary-foreground/5 rounded-xl p-6 border border-primary-foreground/10">
                        <h3 className="font-heading text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-primary-foreground/70">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Exclusions Section */}
        <SectionReveal direction="up">
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-4">
                    Important
                  </span>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    What Easy Cover <span className="text-destructive">Does NOT</span> Cover
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    We don't hide reality. Being clear upfront prevents disputes later.
                  </p>
                </div>

                <div className="bg-destructive/5 rounded-2xl p-8 border border-destructive/20">
                  <div className="space-y-4">
                    {exclusions.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-card"
                      >
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Who Should Opt */}
        <SectionReveal direction="up">
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <img 
                    src={familyCorporate} 
                    alt="Family and corporate relocation" 
                    className="rounded-2xl shadow-xl w-full"
                  loading="lazy" decoding="async" />
                </motion.div>
                
                <div>
                  <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                    Is It For You?
                  </span>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Who Should Opt for <span className="text-secondary">Easy Cover?</span>
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    You should definitely choose it if:
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {whoShouldOpt.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4"
                      >
                        <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0" />
                        <span className="text-foreground font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-secondary/10 rounded-xl p-6 border border-secondary/20">
                    <p className="text-foreground font-medium italic">
                      "If you're trying to save a few rupees by skipping protection, you're gambling — not relocating."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* Our Promise */}
        <SectionReveal direction="up">
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
                  Our Commitment
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Our Promise with <span className="text-secondary">Easy Cover</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                  {promises.map((promise, index) => (
                    <motion.div
                      key={promise}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-card rounded-xl p-4 border border-border hover:border-secondary/30 transition-colors"
                    >
                      <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="text-foreground font-medium text-sm">{promise}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-2xl p-8">
                  <p className="text-xl text-foreground">
                    We don't sell protection as an upsell.<br />
                    <span className="font-bold text-secondary">We offer it as peace of mind.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionReveal>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <Shield className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Add Easy Cover Warranty to Your Move
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Protecting your belongings costs far less than replacing them.<br />
                Speak to our relocation expert and add Easy Cover Warranty to your move.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <a href="tel:+918800446447" className="flex items-center gap-3 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-secondary/90 transition-colors">
                  <Phone className="w-6 h-6" />
                  Call: 8800446447
                </a>
                <a href="mailto:info@panyaglobal.in" className="flex items-center gap-3 bg-primary-foreground/10 text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/20">
                  <Mail className="w-6 h-6" />
                  info@panyaglobal.in
                </a>
              </div>

              <Link to="/quote">
                <Button size="lg" variant="hero" className="gap-2">
                  Get Protected Quote Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default EasyCoverWarranty;
