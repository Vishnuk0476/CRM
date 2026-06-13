import { motion } from "framer-motion";
import { CheckCircle2, ClipboardList, Package, Truck, Home, Wrench, ArrowRight, Users, Building2, Globe, Shield, Clock } from "lucide-react";
import crewImage from "@/assets/gallery/crew-office-packing.webp";
import teamLabWork from "@/assets/gallery/crew-lab-equipment.webp";
import professionalTeam from "@/assets/gallery/crew-packing.webp";

const services = [
  { icon: ClipboardList, label: "Planning", description: "Strategic relocation planning" },
  { icon: Package, label: "Packing", description: "Professional packing solutions" },
  { icon: Truck, label: "Movement", description: "Safe transportation" },
  { icon: Home, label: "Temp. Stay", description: "Temporary accommodation" },
  { icon: CheckCircle2, label: "Settling-in", description: "Home setup services" },
  { icon: Wrench, label: "Post-move", description: "After-move support" },
];

const WhoWeAre = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--secondary)/0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Who We Are
            </motion.span>
            
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              We Are Not Just
              <br />
              <span className="text-secondary">Packers and Movers</span>
            </h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
              Panya Global is a relocation management company that combines logistics, people management, 
              compliance, and technology to deliver predictable outcomes.
            </p>
            
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Our role goes beyond transportation-we manage the entire relocation journey, 
              all under one accountable system:
            </p>

            {/* Key Differentiators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6 mb-10"
            >
              <h3 className="font-semibold text-foreground text-lg">What Sets Us Apart</h3>
              <p className="text-muted-foreground leading-relaxed">
                At Panya Global, we've spent over 15 years perfecting the art of seamless relocation. 
                Our team of industry veterans brings unparalleled expertise to every move, ensuring 
                that your belongings are handled with the utmost care and precision. We combine 
                traditional craftsmanship with cutting-edge technology to deliver a relocation 
                experience that's not just efficient, but truly exceptional. Our comprehensive 
                insurance coverage and transparent claims process provide peace of mind, while our 
                global network of trusted partners ensures we can handle relocations anywhere in the 
                world. With a 98% on-time delivery rate and a commitment to excellence that permeates 
                every aspect of our service, we've built a reputation for reliability and quality 
                that sets us apart in the industry.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Expert Team</h4>
                    <p className="text-sm text-muted-foreground">Industry veterans with 16+ years average experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Comprehensive Protection</h4>
                    <p className="text-sm text-muted-foreground">Easy cover warranty available with transparent claims process</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">On-Time Guarantee</h4>
                    <p className="text-sm text-muted-foreground">98% on-time delivery rate with compensation for delays</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Global Network</h4>
                    <p className="text-sm text-muted-foreground">100+ partners in 70+ countries worldwide</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
                src={crewImage}
                alt="Professional relocation team at work"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
            
            {/* Secondary Overlapping Image (Bottom Left) */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-8 w-1/3 hidden md:block"
            >
              <div className="relative group">
                <img 
                  src={teamLabWork} 
                  alt="Lab Equipment Handling" 
                  className="rounded-2xl object-cover w-full shadow-xl border-4 border-white hover:border-secondary/50 transition-all duration-500 transform hover:scale-105"
                loading="lazy" decoding="async" />
                {/* Animated Stats Badge on Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute -top-3 right-3 bg-gradient-to-br from-secondary to-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white"
                >
                  <span className="flex items-center gap-1">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    Lab Expertise
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Third Overlapping Image (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
              className="absolute top-0 -right-0 lg:-top-6 lg:-right-10 w-1/3 hidden md:block"
            >
              <div className="relative group">
                <img 
                  src={professionalTeam} 
                  alt="Professional Team" 
                  className="rounded-2xl object-cover w-full shadow-xl border-4 border-white hover:border-primary/50 transition-all duration-500 transform hover:scale-105"
                loading="lazy" decoding="async" />
                {/* Animated Stats Badge on Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="absolute bottom-3 left-3 bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white"
                >
                  <span className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                    50+ Experts
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Stats Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 right-6 bg-card p-5 rounded-2xl shadow-xl border border-border"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center"
                >
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <p className="text-3xl font-bold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
