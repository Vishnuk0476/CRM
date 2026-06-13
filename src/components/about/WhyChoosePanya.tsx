import { motion } from "framer-motion";
import { Users, MessageCircle, FileText, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import crewImage from "@/assets/gallery/crew-linkedin.webp";
import crewPacking from "@/assets/gallery/crew-packing.webp";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const reasons = [
  {
    icon: Users,
    title: "Trained Manpower",
    bad: "Not daily labor",
    description: "Professional, trained staff who understand handling protocols"
  },
  {
    icon: MessageCircle,
    title: "Clear Communication",
    bad: "Not excuses",
    description: "Proactive updates and transparent status sharing"
  },
  {
    icon: FileText,
    title: "Documentation",
    bad: "Not confusion",
    description: "Proper paperwork, checklists, and audit trails"
  },
  {
    icon: Shield,
    title: "Accountability",
    bad: "Not blame-shifting",
    description: "Single point of contact with ownership"
  },
];

const commitments = [
  "Transparent pricing",
  "Ethical operations",
  "Asset safety & care",
  "On-time execution",
  "Respect for client time"
];

const WhyChoosePanya = () => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-secondary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                src={crewImage}
                alt="Panya Global professional team"
                className="w-full h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
            
            {/* Secondary Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -bottom-8 -right-8 w-52 h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-background hidden md:block"
            >
              <img 
                src={crewPacking}
                alt="Team packing items"
                className="w-full h-full object-cover"
              loading="lazy" decoding="async" />
            </motion.div>
            
            {/* Quote Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute top-8 -right-4 bg-secondary text-secondary-foreground p-5 rounded-2xl shadow-xl max-w-[280px] hidden lg:block"
            >
              <p className="text-sm font-medium italic leading-relaxed">
                "We don't compete on being the cheapest. We compete on being dependable."
              </p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Why Choose Us
            </span>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Let's Cut
              <span className="text-secondary"> The Noise</span>
            </h2>
            
            <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
              People choose us because we offer what matters most:
            </p>

            <div className="space-y-4 mb-10">
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <reason.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{reason.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {reason.bad}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Commitment Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8"
            >
              <h3 className="font-heading text-lg font-bold text-foreground mb-4">
                Our Commitment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {commitments.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground italic">
                Relocation is stressful enough. Our job is to remove uncertainty.
              </p>
            </motion.div>

            {/* CTA */}
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/quote">
                Get a Free Quote
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoosePanya;
