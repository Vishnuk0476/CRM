import { motion } from "framer-motion";
import { Monitor, Building, Factory, Heart, Briefcase, ShoppingCart, GraduationCap, Landmark } from "lucide-react";
import stretchWrap from "@/assets/gallery/stretch-wrap-team.webp";

const industries = [
  { icon: Monitor, name: "IT & Technology", description: "Tech parks, software companies, startups" },
  { icon: Building, name: "Banking & Financial", description: "Banks, insurance, investment firms" },
  { icon: Factory, name: "Manufacturing", description: "Industrial units, production facilities" },
  { icon: Heart, name: "Pharma & Healthcare", description: "Hospitals, labs, pharma companies" },
  { icon: Briefcase, name: "Consulting Firms", description: "Advisory, legal, management consulting" },
  { icon: ShoppingCart, name: "E-commerce & Startups", description: "Online businesses, new ventures" },
  { icon: GraduationCap, name: "Education & Research", description: "Universities, research institutions" },
  { icon: Landmark, name: "Government & PSUs", description: "Public sector units, govt. departments" },
];

const IndustriesServed = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                src={stretchWrap}
                alt="Professional team at work"
                className="w-full h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
            
            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl border border-border"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-secondary mb-1">150+</p>
                <p className="text-sm text-muted-foreground">Corporate Clients</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Industries We Serve
            </span>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Trusted by
              <span className="text-secondary"> Leading Organizations</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              We work with organizations that value predictability and professionalism. 
              From single relocations to enterprise-level programs, we adapt to scale.
            </p>

            {/* Industries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <industry.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5">
                      {industry.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {industry.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IndustriesServed;
